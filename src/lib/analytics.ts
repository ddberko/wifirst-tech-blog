import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';

const functions = getFunctions(getApp());

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

export async function trackPageView(path: string): Promise<void> {
  try {
    const trackFn = httpsCallable(functions, 'trackEvent');
    await trackFn({
      type: 'page_view',
      path,
      sessionId: getSessionId(),
    });
  } catch (err) {
    console.error('Failed to track page view:', err);
  }
}

export async function trackArticleRead(slug: string, path: string): Promise<void> {
  try {
    const trackFn = httpsCallable(functions, 'trackEvent');
    await trackFn({
      type: 'article_read',
      path,
      slug,
      sessionId: getSessionId(),
    });
  } catch (err) {
    console.error('Failed to track article read:', err);
  }
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
