import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';

const TRACK_URL = "https://us-central1-wifirst-tech-blog.cloudfunctions.net/trackEvent";

const functions = getFunctions(getApp(), 'us-central1');

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

async function track(data: Record<string, string>): Promise<void> {
  try {
    await fetch(TRACK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.error("Failed to track:", err);
  }
}

export async function trackPageView(path: string): Promise<void> {
  await track({ type: "page_view", path, sessionId: getSessionId() });
}

export async function trackArticleRead(slug: string, path: string): Promise<void> {
  await track({ type: "article_read", path, slug, sessionId: getSessionId() });
}

export async function fetchAnalytics(period: number = 30) {
  const getAnalyticsFn = httpsCallable(functions, 'getAnalytics');
  const result = await getAnalyticsFn({ period });
  return result.data as {
    dailyViews: Array<{ date: string; views: number; reads: number }>;
    topArticles: Array<{ slug: string; title: string; views: number }>;
    totalViews: number;
    totalReads: number;
    totalSubscribers: number;
    activeSubscribers: number;
  };
}
