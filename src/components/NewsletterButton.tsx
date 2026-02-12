"use client";

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { subscribeToNewsletter, getSubscriptionStatus } from '@/lib/newsletter';

interface NewsletterButtonProps {
  variant?: 'compact' | 'full';
}

export default function NewsletterButton({ variant = 'compact' }: NewsletterButtonProps) {
  const [user, setUser] = useState<User | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) checkStatus();
    });
    return () => unsub();
  }, []);

  async function checkStatus() {
    try {
      const status = await getSubscriptionStatus();
      if (status) {
        setSubscribed(status.subscribed);
      }
    } catch { /* ignore */ }
    setChecked(true);
  }

  async function handleSubscribe() {
    if (loading || subscribed) return;
    setLoading(true);
    try {
      await subscribeToNewsletter();
      setSubscribed(true);
    } catch (err) {
      console.error('Subscribe failed:', err);
    } finally {
      setLoading(false);
    }
  }

  if (!user || !checked) return null;

  if (variant === 'compact') {
    return (
      <button
        onClick={handleSubscribe}
        disabled={loading || subscribed}
        className={`p-2 rounded-lg transition-all ${
          subscribed
            ? 'text-green-600 bg-green-50'
            : 'text-gray-500 hover:text-[#0066CC] hover:bg-blue-50'
        }`}
        title={subscribed ? 'Subscribed to newsletter' : 'Subscribe to newsletter'}
      >
        {loading ? (
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : subscribed ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        )}
      </button>
    );
  }

  // Full variant for article footer
  return (
    <div className="bg-gradient-to-r from-[#0066CC]/5 to-blue-50 rounded-2xl p-8 text-center">
      <div className="w-14 h-14 bg-[#0066CC]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-[#0066CC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {subscribed ? 'You\'re subscribed!' : 'Stay updated'}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {subscribed
          ? 'You\'ll receive an email when new articles are published.'
          : 'Get notified when we publish new articles. No spam, unsubscribe anytime.'}
      </p>
      {!subscribed && (
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0066CC] text-white font-semibold rounded-xl hover:bg-[#0052a3] shadow-lg shadow-blue-200/50 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Subscribing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Subscribe to Newsletter
            </>
          )}
        </button>
      )}
    </div>
  );
}
