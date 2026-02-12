"use client";

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView, trackArticleRead } from '@/lib/analytics';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tracked = useRef<string>('');

  useEffect(() => {
    const fullPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

    // Don't track the same page twice in same render cycle
    if (tracked.current === fullPath) return;
    tracked.current = fullPath;

    // Track page view
    trackPageView(fullPath);

    // If on a post page, also track article_read
    const slug = searchParams.get('slug');
    if ((pathname === '/post' || pathname === '/post/') && slug) {
      trackArticleRead(slug, fullPath);
    }
  }, [pathname, searchParams]);

  return null;
}
