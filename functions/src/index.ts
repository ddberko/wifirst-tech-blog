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
  default: "\"Veille techno Wifirst\" <noreply@wifirst.fr>",
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
// Rate limiting for trackEvent (per IP)
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// ---------------------------------------------------------------------------
// Rate limiting for subscribe (per UID)
// ---------------------------------------------------------------------------
const subscribeRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const SUBSCRIBE_LIMIT = 3;
const SUBSCRIBE_WINDOW_MS = 3_600_000; // 1 hour

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

  const categoryHtml = article.category 
    ? `<div style="display: inline-block; padding: 4px 12px; background-color: #e0f2fe; color: #0369a1; font-size: 12px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; margin-bottom: 20px; font-family: system-ui, -apple-system, sans-serif;">${article.category}</div>`
    : "";

  const coverHtml = article.coverImage
    ? `<tr><td style="padding-bottom: 30px;"><img src="${article.coverImage}" alt="Cover Image" width="520" style="width: 100%; max-width: 520px; border-radius: 8px; display: block;"></td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="fr" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.title ?? "Nouvel article"}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; width: 100%; background-color: #f3f4f6; -webkit-font-smoothing: antialiased; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    table { border-collapse: collapse; }
    img { border: 0; outline: none; text-decoration: none; max-width: 100%; height: auto; display: block; }
    a { color: #0066cc; text-decoration: none; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6;">
  <div style="padding: 40px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center">
          <table cellpadding="0" cellspacing="0" role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <!-- Header -->
            <tr>
              <td style="background-color: #0f172a; padding: 32px 40px; text-align: center;">
                <h2 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; font-family: system-ui, -apple-system, sans-serif;">Wifirst Tech Blog</h2>
                <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 13px; text-transform: uppercase; font-weight: 600; font-family: system-ui, -apple-system, sans-serif; letter-spacing: 1px;">Veille Technologique B2B</p>
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td style="padding: 40px;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr><td>${categoryHtml}</td></tr>
                  <tr>
                    <td>
                      <h1 style="margin: 0 0 24px 0; font-size: 26px; line-height: 1.3; color: #0f172a; font-weight: 800; font-family: system-ui, -apple-system, sans-serif;">${article.title ?? ""}</h1>
                    </td>
                  </tr>
                  ${coverHtml}
                  <tr>
                    <td>
                      <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #475569; font-family: system-ui, -apple-system, sans-serif;">
                        ${article.excerpt ?? ""}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top: 8px;">
                      <table cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td align="center" style="border-radius: 8px; background-color: #0ea5e9;">
                            <a href="${postUrl}" target="_blank" style="display: inline-block; padding: 16px 32px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; font-family: system-ui, -apple-system, sans-serif;">Lire l'article complet &rarr;</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding: 32px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="margin: 0 0 12px 0; font-size: 13px; color: #64748b; line-height: 1.5; font-family: system-ui, -apple-system, sans-serif;">
                  © 2026 Wifirst. Cet e-mail vous a été envoyé car vous êtes abonné(e) aux notifications du Wifirst Tech Blog.
                </p>
                <p style="margin: 0; font-size: 13px; font-family: system-ui, -apple-system, sans-serif;">
                  <a href="${unsubscribeUrl}" style="color: #64748b; text-decoration: underline;">Gérer vos préférences de désabonnement</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
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
    SMTP_FROM.value() || process.env.SMTP_FROM || "\"Veille techno Wifirst\" <noreply@wifirst.fr>";

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

  const uid = request.auth.uid;

  // Rate limit: max 3 subscribe attempts per UID per hour
  const now = Date.now();
  const subEntry = subscribeRateLimitMap.get(uid);
  if (!subEntry || now > subEntry.resetAt) {
    subscribeRateLimitMap.set(uid, { count: 1, resetAt: now + SUBSCRIBE_WINDOW_MS });
  } else if (subEntry.count >= SUBSCRIBE_LIMIT) {
    throw new HttpsError("resource-exhausted", "Too many subscription attempts. Try again later.");
  } else {
    subEntry.count++;
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

    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
    if (!checkRateLimit(ip)) {
      res.status(429).json({ error: "Rate limit exceeded" });
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
  if (request.auth.token.role !== "admin") {
    throw new HttpsError("permission-denied", "Only admins can access subscribers.");
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

  if (request.auth.token.role !== "admin") {
    throw new HttpsError(
      "permission-denied",
      "Only admins can access analytics."
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

// ---------------------------------------------------------------------------
// f) initializeAdmin -- HTTPS callable (bootstrap first admin)
// ---------------------------------------------------------------------------
export const initializeAdmin = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }

  const callerEmail = request.auth.token.email;
  if (callerEmail !== ADMIN_EMAIL) {
    throw new HttpsError(
      "permission-denied",
      "Only the designated admin email can initialize."
    );
  }

  // Check if an admin already exists in Firestore users collection
  const existingAdmins = await db
    .collection("users")
    .where("role", "==", "admin")
    .limit(1)
    .get();

  if (!existingAdmins.empty) {
    throw new HttpsError(
      "already-exists",
      "An admin already exists."
    );
  }

  const uid = request.auth.uid;

  // Set custom claim
  await admin.auth().setCustomUserClaims(uid, { role: "admin" });

  // Create user doc
  await db.collection("users").doc(uid).set({
    email: callerEmail,
    displayName: request.auth.token.name || "",
    role: "admin",
    addedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true };
});

// ---------------------------------------------------------------------------
// g) setUserRole -- HTTPS callable (admin only)
// ---------------------------------------------------------------------------
export const setUserRole = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }
  if (request.auth.token.role !== "admin") {
    throw new HttpsError("permission-denied", "Only admins can set user roles.");
  }

  const { uid, role } = request.data as { uid?: string; role?: string };

  if (!uid || !role) {
    throw new HttpsError("invalid-argument", "uid and role are required.");
  }

  const validRoles = ["reader", "publisher", "admin"];
  if (!validRoles.includes(role)) {
    throw new HttpsError(
      "invalid-argument",
      "role must be one of: reader, publisher, admin."
    );
  }

  // Set custom claim
  await admin.auth().setCustomUserClaims(uid, { role });

  // Upsert user doc
  const userRef = db.collection("users").doc(uid);
  const userDoc = await userRef.get();

  if (userDoc.exists) {
    await userRef.update({
      role,
      updatedBy: request.auth.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } else {
    // Fetch user info from Firebase Auth
    const userRecord = await admin.auth().getUser(uid);
    await userRef.set({
      email: userRecord.email || "",
      displayName: userRecord.displayName || "",
      role,
      addedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: request.auth.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  return { success: true };
});

// ---------------------------------------------------------------------------
// h) removeUserRole -- HTTPS callable (admin only)
// ---------------------------------------------------------------------------
export const removeUserRole = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }
  if (request.auth.token.role !== "admin") {
    throw new HttpsError("permission-denied", "Only admins can remove user roles.");
  }

  const { uid } = request.data as { uid?: string };

  if (!uid) {
    throw new HttpsError("invalid-argument", "uid is required.");
  }

  // Clear custom claims
  await admin.auth().setCustomUserClaims(uid, {});

  // Delete user doc
  await db.collection("users").doc(uid).delete();

  return { success: true };
});

// ---------------------------------------------------------------------------
// i) listManagedUsers -- HTTPS callable (admin only)
// ---------------------------------------------------------------------------
export const listManagedUsers = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }
  if (request.auth.token.role !== "admin") {
    throw new HttpsError("permission-denied", "Only admins can list users.");
  }

  // Get all Firebase Auth users (up to 1000)
  const listResult = await admin.auth().listUsers(1000);

  // Get Firestore metadata for cross-referencing
  const usersSnap = await db.collection("users").get();
  const firestoreMeta = new Map(usersSnap.docs.map((d) => [d.id, d.data()]));

  const users = listResult.users.map((u) => {
    const meta = firestoreMeta.get(u.uid);
    return {
      uid: u.uid,
      email: u.email || "",
      displayName: u.displayName || "",
      photoURL: u.photoURL || "",
      role: (u.customClaims?.role as string) || null,
      lastSignIn: u.metadata.lastSignInTime || null,
      addedAt: meta?.addedAt?.toDate?.()?.toISOString() || null,
      updatedAt: meta?.updatedAt?.toDate?.()?.toISOString() || null,
    };
  });

  return { users };
});

// ---------------------------------------------------------------------------
// j) getUserByEmail -- HTTPS callable (admin only)
// ---------------------------------------------------------------------------
export const getUserByEmail = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }
  if (request.auth.token.role !== "admin") {
    throw new HttpsError("permission-denied", "Only admins can look up users.");
  }

  const { email } = request.data as { email?: string };
  if (!email) {
    throw new HttpsError("invalid-argument", "email is required.");
  }

  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    return {
      uid: userRecord.uid,
      email: userRecord.email || "",
      displayName: userRecord.displayName || "",
    };
  } catch {
    throw new HttpsError("not-found", "No user found with this email.");
  }
});
