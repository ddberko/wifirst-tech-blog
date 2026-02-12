import { db, auth } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';

const functions = getFunctions(getApp(), 'us-central1');

export async function subscribeToNewsletter(categories: string[] = []): Promise<{ success: boolean; message: string }> {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be signed in to subscribe');

  const subscribeFn = httpsCallable(functions, 'subscribe');
  const result = await subscribeFn({
    email: user.email,
    displayName: user.displayName || 'Anonymous',
    categories,
  });
  return result.data as { success: boolean; message: string };
}

export async function getSubscriptionStatus(): Promise<{ subscribed: boolean; categories: string[] } | null> {
  const user = auth.currentUser;
  if (!user) return null;

  const docRef = doc(db, 'subscribers', user.uid);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return { subscribed: false, categories: [] };

  const data = snap.data();
  return {
    subscribed: data.active === true,
    categories: data.categories || [],
  };
}

export async function updateSubscriptionPreferences(categories: string[]): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be signed in');

  // Re-subscribe with new categories
  const subscribeFn = httpsCallable(functions, 'subscribe');
  await subscribeFn({
    email: user.email,
    displayName: user.displayName || 'Anonymous',
    categories,
  });
}

export async function unsubscribeFromNewsletter(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be signed in');

  // Set active to false via direct Firestore update
  const { updateDoc } = await import('firebase/firestore');
  const docRef = doc(db, 'subscribers', user.uid);
  await updateDoc(docRef, { active: false });
}
