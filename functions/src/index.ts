import * as admin from "firebase-admin";
import { onDocumentUpdated, onDocumentCreated } from "firebase-functions/v2/firestore";
import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { defineString } from "firebase-functions/params";
import * as nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";

// ---------------------------------------------------------------------------
// Firebase Admin initialisation
// ---------------------------------------------------------------------------
admin.initializeApp();
const db = admin.firestore();

// ---------------------------------------------------------------------------
// Environment / params
// ---------------------------------------------------------------------------
const SMTP_HOST = defineString("SMTP_HOST", { default: "" });
const SMTP_PORT = defineString("SMTP_PORT", { default: "587" });
const SMTP_USER = defineString("SMTP_USER", { default: "" });
const SMTP_PASS = defineString("SMTP_PASS", { default: "" });
const SMTP_FROM = defineString("SMTP_FROM", {
  default: "noreply@wifirst.fr",
});
const SITE_URL = defineString("SITE_URL", {
  default: "https://wifirst-tech-blog.web.app",
});

const ADMIN_EMAIL = "david.berkowicz@wifirst.fr";

// ---------------------------------------------------------------------------
// CORS middleware for onRequest handlers
// ---------------------------------------------------------------------------
const corsMiddleware = cors({ origin: true });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface Subscriber {
  uid: string;
  email: string;
  displayName: string;
  subscribedAt: admin.firestore.Timestamp;
  active: boolean;
  categories: string[];
  unsubscribeToken: string;
}

interface ArticleData {
  title?: string;
  excerpt?: string;
  coverImage?: string;
  slug?: string;
  status?: string;
  category?: string;
}

interface AnalyticsEvent {
  type: string;
  path: string;
  slug?: string;
  sessionId: string;
  userId?: string;
  timestamp: admin.firestore.Timestamp;
  date: string;
}

/**
 * Build a responsive HTML email for a newly published article.
 */
function buildArticleEmail(
  article: ArticleData,
  unsubscribeToken: string,
  siteUrl: string
): string {
  const postUrl = `${siteUrl}/post?slug=${article.slug ?? ""}`;
  const unsubscribeUrl = `${siteUrl}/api/unsubscribe?token=${unsubscribeToken}`;

  const coverHtml = article.coverImage
    ? `<img src="${article.coverImage}" alt="${article.title ?? ""}" style="width:100%;max-width:600px;border-radius:8px;margin-bottom:24px;" />`
    : "";

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${article.title ?? "Nouvel article"}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color:#0D8ABC;padding:24px 32px;">
              <h2 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">Wifirst Tech Blog</h2>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${coverHtml}
              <h1 style="margin:0 0 16px;font-size:24px;color:#1a1a1a;">${article.title ?? ""}</h1>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#4a4a4a;">
                ${article.excerpt ?? ""}
              </p>
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="border-radius:6px;background-color:#0D8ABC;">
                    <a href="${postUrl}" target="_blank" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;">
                      Lire l&rsquo;article
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #e5e5e5;text-align:center;">
              <p style="margin:0 0 8px;font-size:14px;color:#888888;">Wifirst Tech Blog</p>
              <p style="margin:0;font-size:12px;color:#aaaaaa;">
                Vous recevez cet e-mail car vous êtes abonné(e) au blog.
                <br />
                <a href="${unsubscribeUrl}" style="color:#0D8ABC;text-decoration:underline;">Se désabonner</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

/**
 * Create a nodemailer transporter from environment config.
 */
function createTransporter(): nodemailer.Transporter {
  const host = SMTP_HOST.value() || process.env.SMTP_HOST || "";
  const port = parseInt(
    SMTP_PORT.value() || process.env.SMTP_PORT || "587",
    10
  );
  const user = SMTP_USER.value() || process.env.SMTP_USER || "";
  const pass = SMTP_PASS.value() || process.env.SMTP_PASS || "";

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

// ---------------------------------------------------------------------------
// a) Newsletter sending logic (shared between create & update triggers)
// ---------------------------------------------------------------------------

/**
 * Send newsletter emails for a published article.
 * Uses `newsletterSentAt` field to guarantee emails are sent only ONCE per article.
 */
async function sendNewsletterForArticle(
  articleRef: admin.firestore.DocumentReference,
  articleData: ArticleData
): Promise<void> {
  const siteUrl =
    SITE_URL.value() ||
    process.env.SITE_URL ||
    "https://wifirst-tech-blog.web.app";

  // Guard: only send for published articles
  if (articleData.status !== "published") {
    console.log("[newsletter] Article not published, skipping.");
    return;
  }

  // Guard: check newsletterSentAt to prevent duplicate sends
  const currentDoc = await articleRef.get();
  const currentData = currentDoc.data();
  if (currentData?.newsletterSentAt) {
    console.log("[newsletter] Newsletter already sent for this article, skipping.");
    return;
  }

  // Mark as sent FIRST (optimistic lock to prevent race conditions)
  await articleRef.update({ newsletterSentAt: admin.firestore.Timestamp.now() });

  // Fetch active subscribers
  const subscribersSnap = await db
    .collection("subscribers")
    .where("active", "==", true)
    .get();

  console.log(`[newsletter] Found ${subscribersSnap.size} active subscribers.`);
  if (subscribersSnap.empty) return;

  const transporter = createTransporter();
  const fromAddress =
    SMTP_FROM.value() || process.env.SMTP_FROM || "noreply@wifirst.fr";

  const sendPromises = subscribersSnap.docs
    .map((doc) => doc.data() as Subscriber)
    .filter((subscriber) => {
      if (
        subscriber.categories &&
        subscriber.categories.length > 0 &&
        articleData.category
      ) {
        return subscriber.categories.includes(articleData.category);
      }
      return true;
    })
    .map(async (subscriber) => {
      const html = buildArticleEmail(
        articleData,
        subscriber.unsubscribeToken,
        siteUrl
      );

      try {
        console.log(`[newsletter] Sending email to ${subscriber.email}...`);
        await transporter.sendMail({
          from: fromAddress,
          to: subscriber.email,
          subject: `Nouvel article : ${articleData.title ?? "Sans titre"}`,
          html,
        });
        console.log(`[newsletter] Email sent to ${subscriber.email} ✅`);
      } catch (err) {
        console.error(
          `[newsletter] Failed to send email to ${subscriber.email}:`,
          err
        );
      }
    });

  await Promise.all(sendPromises);
}

// ---------------------------------------------------------------------------
// a1) onArticleCreated -- Firestore trigger (new articles)
// ---------------------------------------------------------------------------
export const onArticleCreated = onDocumentCreated(
  "articles/{articleId}",
  async (event) => {
    const articleData = event.data?.data() as ArticleData | undefined;
    if (!articleData) {
      console.log("[onArticleCreated] No data, skipping.");
      return;
    }
    console.log("[onArticleCreated] New article status:", articleData.status);
    await sendNewsletterForArticle(event.data!.ref, articleData);
  }
);

// ---------------------------------------------------------------------------
// a2) onArticlePublished -- Firestore trigger (draft → published updates)
// ---------------------------------------------------------------------------
export const onArticlePublished = onDocumentUpdated(
  "articles/{articleId}",
  async (event) => {
    const beforeData = event.data?.before.data() as ArticleData | undefined;
    const afterData = event.data?.after.data() as ArticleData | undefined;

    if (!beforeData || !afterData) {
      console.log("[onArticlePublished] No before/after data, skipping.");
      return;
    }

    console.log("[onArticlePublished] Before status:", beforeData.status, "After status:", afterData.status);

    // Only fire on status transition to "published"
    const wasDraft = !beforeData.status || beforeData.status !== "published";
    const isNowPublished = afterData.status === "published";

    if (wasDraft && isNowPublished) {
      await sendNewsletterForArticle(event.data!.after.ref, afterData);
    }
  }
);

// ---------------------------------------------------------------------------
// b) subscribe -- HTTPS callable
// ---------------------------------------------------------------------------
export const subscribe = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "You must be signed in to subscribe."
    );
  }

  const { email, displayName, categories } = request.data as {
    email?: string;
    displayName?: string;
    categories?: string[];
  };

  if (!email || !displayName) {
    throw new HttpsError(
      "invalid-argument",
      "email and displayName are required."
    );
  }

  const uid = request.auth.uid;
  const subscriberRef = db.collection("subscribers").doc(uid);
  const existing = await subscriberRef.get();

  const subscriberData: Subscriber = {
    uid,
    email,
    displayName,
    subscribedAt: admin.firestore.Timestamp.now(),
    active: true,
    categories: categories ?? [],
    unsubscribeToken: existing.exists
      ? (existing.data() as Subscriber).unsubscribeToken || uuidv4()
      : uuidv4(),
  };

  await subscriberRef.set(subscriberData, { merge: true });

  return { success: true, message: "Subscribed successfully" };
});

// ---------------------------------------------------------------------------
// c) unsubscribe -- HTTPS request (direct URL, not callable)
// ---------------------------------------------------------------------------
export const unsubscribe = onRequest(async (req, res) => {
  corsMiddleware(req, res, async () => {
    const siteUrl =
      SITE_URL.value() ||
      process.env.SITE_URL ||
      "https://wifirst-tech-blog.web.app";

    try {
      const token = req.query.token as string | undefined;

      if (!token) {
        res.redirect(`${siteUrl}/unsubscribe?status=error`);
        return;
      }

      const snapshot = await db
        .collection("subscribers")
        .where("unsubscribeToken", "==", token)
        .limit(1)
        .get();

      if (snapshot.empty) {
        res.redirect(`${siteUrl}/unsubscribe?status=error`);
        return;
      }

      await snapshot.docs[0].ref.update({ active: false });

      res.redirect(`${siteUrl}/unsubscribe?status=success`);
    } catch (err) {
      console.error("Unsubscribe error:", err);
      res.redirect(`${siteUrl}/unsubscribe?status=error`);
    }
  });
});

// ---------------------------------------------------------------------------
// d) trackEvent -- HTTPS callable
// ---------------------------------------------------------------------------
export const trackEvent = onRequest({ invoker: "public" }, async (req, res) => {
  corsMiddleware(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const { type, path, slug, sessionId } = req.body as {
        type?: string;
        path?: string;
        slug?: string;
        sessionId?: string;
      };

      // Validate input
      const allowedTypes = ["page_view", "article_read"];
      if (!type || !allowedTypes.includes(type)) {
        res.status(400).json({ error: "type must be 'page_view' or 'article_read'" });
        return;
      }
      if (!path) {
        res.status(400).json({ error: "path is required" });
        return;
      }
      if (!sessionId) {
        res.status(400).json({ error: "sessionId is required" });
        return;
      }

      // Simple deduplication via document ID (sessionId_type_path_dateHour)
      const currentTime = new Date();
      const hourKey = currentTime.toISOString().slice(0, 13); // YYYY-MM-DDTHH
      const dedupeId = `${sessionId}_${type}_${path.replace(/\//g, "_")}_${hourKey}`;
      const dedupeRef = db.collection("analytics").doc(dedupeId);
      const existing = await dedupeRef.get();

      if (existing.exists) {
        res.status(200).json({ success: true });
        return;
      }

      const dateStr = currentTime.toISOString().slice(0, 10);

      const eventData: AnalyticsEvent = {
        type,
        path,
        sessionId,
        timestamp: admin.firestore.Timestamp.now(),
        date: dateStr,
      };

      if (slug) eventData.slug = slug;

      await dedupeRef.set(eventData);
      res.status(200).json({ success: true });
    } catch (err) {
      console.error("trackEvent error:", err);
      res.status(500).json({ error: "Internal error" });
    }
  });
});

// ---------------------------------------------------------------------------
// e-bis) getSubscribers -- HTTPS callable (admin only)
// ---------------------------------------------------------------------------
export const getSubscribers = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }
  if (request.auth.token.email !== ADMIN_EMAIL) {
    throw new HttpsError("permission-denied", "Only the admin can access subscribers.");
  }

  const subscribersSnap = await db.collection("subscribers").get();
  const subscribers = subscribersSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: data.uid || doc.id,
      email: data.email,
      displayName: data.displayName || "",
      active: data.active ?? false,
      subscribedAt: data.subscribedAt?.toDate?.()?.toISOString() || null,
      categories: data.categories || data.preferences?.categories || [],
    };
  });

  return {
    total: subscribers.length,
    active: subscribers.filter((s) => s.active).length,
    subscribers,
  };
});

// ---------------------------------------------------------------------------
// e) getAnalytics -- HTTPS callable (admin only)
// ---------------------------------------------------------------------------
export const getAnalytics = onCall(async (request) => {
  // Auth check
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "You must be signed in."
    );
  }

  if (request.auth.token.email !== ADMIN_EMAIL) {
    throw new HttpsError(
      "permission-denied",
      "Only the admin can access analytics."
    );
  }

  const { period } = request.data as { period?: number };
  const days = period ?? 30;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startTimestamp = admin.firestore.Timestamp.fromDate(startDate);

  // Fetch analytics events within the period
  const eventsSnap = await db
    .collection("analytics")
    .where("timestamp", ">=", startTimestamp)
    .get();

  // Build daily views map
  const dailyMap = new Map<string, { views: number; reads: number }>();
  // Build top articles map
  const articleViewsMap = new Map<string, number>();

  let totalViews = 0;
  let totalReads = 0;

  for (const doc of eventsSnap.docs) {
    const data = doc.data() as AnalyticsEvent;
    const dateKey = data.date;

    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, { views: 0, reads: 0 });
    }

    const dayEntry = dailyMap.get(dateKey)!;

    if (data.type === "page_view") {
      dayEntry.views += 1;
      totalViews += 1;
    } else if (data.type === "article_read") {
      dayEntry.reads += 1;
      totalReads += 1;

      if (data.slug) {
        articleViewsMap.set(
          data.slug,
          (articleViewsMap.get(data.slug) ?? 0) + 1
        );
      }
    }
  }

  // Sort daily views by date ascending
  const dailyViews = Array.from(dailyMap.entries())
    .map(([date, stats]) => ({ date, views: stats.views, reads: stats.reads }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Top articles: get top 10 slugs, then fetch titles from articles collection
  const sortedSlugs = Array.from(articleViewsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const topArticles: Array<{ slug: string; title: string; views: number }> = [];

  for (const [slug, views] of sortedSlugs) {
    // Try to find article by slug
    const articleSnap = await db
      .collection("articles")
      .where("slug", "==", slug)
      .limit(1)
      .get();

    const title = articleSnap.empty
      ? slug
      : (articleSnap.docs[0].data().title as string) || slug;

    topArticles.push({ slug, title, views });
  }

  // Subscriber counts
  const allSubscribersSnap = await db.collection("subscribers").get();
  const totalSubscribers = allSubscribersSnap.size;

  const activeSubscribersSnap = await db
    .collection("subscribers")
    .where("active", "==", true)
    .get();
  const activeSubscribers = activeSubscribersSnap.size;

  return {
    dailyViews,
    topArticles,
    totalViews,
    totalReads,
    totalSubscribers,
    activeSubscribers,
  };
});
