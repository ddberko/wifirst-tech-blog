"use client";

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { fetchAnalytics } from '@/lib/analytics';
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const ADMIN_EMAIL = 'david.berkowicz@wifirst.fr';

interface AnalyticsData {
  dailyViews: Array<{ date: string; views: number; reads: number }>;
  topArticles: Array<{ slug: string; title: string; views: number }>;
  totalViews: number;
  totalReads: number;
  totalSubscribers: number;
  activeSubscribers: number;
}

// Dynamic chart component to avoid SSR issues with recharts
const AnalyticsChart = dynamic(() => import('./chart'), { ssr: false });

function AnalyticsContent() {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (user && user.email === ADMIN_EMAIL) {
      loadAnalytics();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, period]);

  async function loadAnalytics() {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAnalytics(period);
      setData(result);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }

  if (user && user.email !== ADMIN_EMAIL) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500">You don&apos;t have permission to view analytics.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1 text-sm">Blog performance and engagement metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin" className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Back to Admin
          </Link>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-2 mb-6">
        {[7, 14, 30, 90].map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              period === p
                ? 'bg-[#0066CC] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p}d
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="inline-flex items-center gap-3 text-gray-400">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading analytics...
          </div>
        </div>
      ) : error ? (
        <div className="py-24 text-center">
          <p className="text-red-500">{error}</p>
          <button onClick={loadAnalytics} className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">
            Retry
          </button>
        </div>
      ) : data ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <p className="text-sm text-gray-500 mb-1">Total Views</p>
              <p className="text-3xl font-bold text-gray-900">{data.totalViews.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <p className="text-sm text-gray-500 mb-1">Article Reads</p>
              <p className="text-3xl font-bold text-[#0066CC]">{data.totalReads.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <p className="text-sm text-gray-500 mb-1">Total Subscribers</p>
              <p className="text-3xl font-bold text-gray-900">{data.totalSubscribers.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <p className="text-sm text-gray-500 mb-1">Active Subscribers</p>
              <p className="text-3xl font-bold text-green-600">{data.activeSubscribers.toLocaleString()}</p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Activity</h2>
            {data.dailyViews.length > 0 ? (
              <AnalyticsChart data={data.dailyViews} />
            ) : (
              <p className="text-gray-400 text-center py-12">No data for this period</p>
            )}
          </div>

          {/* Top Articles */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Top 10 Articles</h2>
            </div>
            {data.topArticles.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {data.topArticles.map((article, i) => (
                  <div key={article.slug} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                    <span className="text-sm font-bold text-gray-300 w-8">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/post?slug=${article.slug}`}
                        className="text-sm font-medium text-gray-900 hover:text-[#0066CC] truncate block"
                      >
                        {article.title || article.slug}
                      </Link>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{article.views} reads</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-12">No article reads yet</p>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <AuthGuard>
      <AnalyticsContent />
    </AuthGuard>
  );
}
