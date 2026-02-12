"use client";

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getSubscriptionStatus, subscribeToNewsletter, unsubscribeFromNewsletter, updateSubscriptionPreferences } from '@/lib/newsletter';
import { getCategories } from '@/lib/posts';
import AuthGuard from '@/components/AuthGuard';
import Image from 'next/image';

function ProfileContent() {
  const [user, setUser] = useState<User | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) loadData();
    });
    return () => unsub();
  }, []);

  async function loadData() {
    try {
      const [status, cats] = await Promise.all([
        getSubscriptionStatus(),
        getCategories()
      ]);
      if (status) {
        setSubscribed(status.subscribed);
        setSelectedCategories(status.categories);
      }
      setAllCategories(cats);
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleSubscription() {
    setSaving(true);
    setMessage(null);
    try {
      if (subscribed) {
        await unsubscribeFromNewsletter();
        setSubscribed(false);
        setMessage({ type: 'success', text: 'Successfully unsubscribed from newsletter.' });
      } else {
        await subscribeToNewsletter(selectedCategories);
        setSubscribed(true);
        setMessage({ type: 'success', text: 'Successfully subscribed to newsletter!' });
      }
    } catch (err) {
      console.error('Error toggling subscription:', err);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  function handleCategoryToggle(cat: string) {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }

  async function handleSavePreferences() {
    setSaving(true);
    setMessage(null);
    try {
      await updateSubscriptionPreferences(selectedCategories);
      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
    } catch (err) {
      console.error('Error saving preferences:', err);
      setMessage({ type: 'error', text: 'Failed to save preferences.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-3 text-gray-400">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Profile</h1>

      {message && (
        <div className={`mb-6 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* User Info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Account</h2>
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            <Image src={user.photoURL} alt={user.displayName || ''} width={56} height={56} className="rounded-full" />
          ) : (
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
              {user?.displayName?.charAt(0) || 'U'}
            </div>
          )}
          <div>
            <p className="text-lg font-semibold text-gray-900">{user?.displayName}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Newsletter Subscription */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Newsletter</h2>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-medium text-gray-900">Email notifications</p>
            <p className="text-sm text-gray-500">Receive an email when new articles are published</p>
          </div>
          <button
            onClick={handleToggleSubscription}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              subscribed ? 'bg-[#0066CC]' : 'bg-gray-300'
            } ${saving ? 'opacity-50' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                subscribed ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <div className={`px-3 py-2 rounded-lg text-sm ${subscribed ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
          {subscribed ? 'You are subscribed to the newsletter' : 'You are not subscribed'}
        </div>
      </div>

      {/* Category Preferences */}
      {subscribed && allCategories.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Category Preferences</h2>
          <p className="text-sm text-gray-500 mb-4">
            Select categories to filter notifications. Leave all unchecked to receive all articles.
          </p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {allCategories.map(cat => (
              <label key={cat} className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => handleCategoryToggle(cat)}
                  className="w-4 h-4 rounded border-gray-300 text-[#0066CC] focus:ring-[#0066CC]"
                />
                <span className="text-sm text-gray-700">{cat}</span>
              </label>
            ))}
          </div>
          <button
            onClick={handleSavePreferences}
            disabled={saving}
            className="px-4 py-2 bg-[#0066CC] text-white text-sm font-medium rounded-lg hover:bg-[#0052a3] transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
