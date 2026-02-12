"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from "firebase/app";

export default function NewsletterConsent() {
  const [show, setShow] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Check if already a subscriber
        try {
          const subRef = doc(db, "subscribers", u.uid);
          const subSnap = await getDoc(subRef);
          if (!subSnap.exists()) {
            // Check if user dismissed the popup before
            const dismissed = sessionStorage.getItem(`newsletter_dismissed_${u.uid}`);
            if (!dismissed) {
              setShow(true);
            }
          }
        } catch (err) {
          console.error("Error checking subscriber status:", err);
        }
      } else {
        setShow(false);
      }
    });
    return () => unsub();
  }, []);

  async function handleSubscribe() {
    if (!user) return;
    setLoading(true);
    try {
      const functions = getFunctions(getApp(), "us-central1");
      const subscribeFn = httpsCallable(functions, "subscribe");
      await subscribeFn({
        email: user.email,
        displayName: user.displayName || user.email?.split("@")[0] || "",
        categories: [],
      });
      setShow(false);
    } catch (err) {
      console.error("Subscribe error:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleDismiss() {
    if (user) {
      sessionStorage.setItem(`newsletter_dismissed_${user.uid}`, "true");
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in slide-in-from-bottom-4">
        {/* Icon */}
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
          <svg className="w-7 h-7 text-[#0066CC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Restez informé ! 📬
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Recevez un email à chaque nouvel article publié sur le Wifirst Tech Blog.
          Pas de spam, uniquement du contenu technique pertinent.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="flex-1 px-5 py-3 bg-[#0066CC] text-white font-semibold rounded-xl hover:bg-[#0052a3] transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Inscription...
              </span>
            ) : (
              "S'abonner à la newsletter"
            )}
          </button>
          <button
            onClick={handleDismiss}
            className="px-5 py-3 text-gray-500 font-medium rounded-xl hover:bg-gray-100 transition-colors text-sm"
          >
            Non merci
          </button>
        </div>

        {/* Fine print */}
        <p className="text-xs text-gray-400 mt-4">
          Vous pourrez vous désabonner à tout moment depuis votre profil ou via le lien dans chaque email.
        </p>
      </div>
    </div>
  );
}
