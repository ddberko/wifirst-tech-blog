"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from "firebase/app";
import Link from "next/link";

const ADMIN_EMAIL = "david.berkowicz@wifirst.fr";

interface Subscriber {
  uid: string;
  email: string;
  displayName: string;
  active: boolean;
  subscribedAt: string | null;
  categories: string[];
}

interface SubscribersData {
  total: number;
  active: number;
  subscribers: Subscriber[];
}

export default function SubscribersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<SubscribersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (user && user.email === ADMIN_EMAIL) {
      loadSubscribers();
    }
  }, [user]);

  async function loadSubscribers() {
    setLoading(true);
    setError(null);
    try {
      const functions = getFunctions(getApp(), "us-central1");
      const getSubscribersFn = httpsCallable(functions, "getSubscribers");
      const result = await getSubscribersFn({});
      setData(result.data as SubscribersData);
    } catch (err) {
      console.error("Error loading subscribers:", err);
      setError("Erreur lors du chargement des abonnés");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
        <p className="text-gray-500">Cette page est réservée aux administrateurs.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Abonnés Newsletter</h1>
          <p className="text-gray-500 mt-1 text-sm">Gestion des abonnements au blog</p>
        </div>
        <Link
          href="/admin"
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#0066CC] rounded-lg hover:bg-blue-50 transition-all self-start"
        >
          ← Retour admin
        </Link>
      </div>

      {/* Stats cards */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total abonnés</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{data.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Actifs</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{data.active}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Désabonnés</p>
            <p className="text-3xl font-bold text-red-500 mt-1">{data.total - data.active}</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700 text-sm">{error}</p>
          <button onClick={loadSubscribers} className="text-red-600 underline text-sm mt-1">
            Réessayer
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 text-gray-500">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Chargement...
          </div>
        </div>
      )}

      {/* Subscribers - Card view on mobile, table on desktop */}
      {!loading && data && (
        <>
          {/* Mobile: card layout */}
          <div className="md:hidden space-y-3">
            {data.subscribers.map((sub) => (
              <div key={sub.uid} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{sub.email}</p>
                  {sub.active ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 shrink-0 ml-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 shrink-0 ml-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      Inactif
                    </span>
                  )}
                </div>
                {sub.displayName && <p className="text-sm text-gray-600 mb-1">{sub.displayName}</p>}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
                  <span>{sub.categories.length > 0 ? sub.categories.join(", ") : "Toutes catégories"}</span>
                </div>
              </div>
            ))}
            {data.subscribers.length === 0 && (
              <div className="text-center py-12 text-gray-400">Aucun abonné pour le moment</div>
            )}
          </div>

          {/* Desktop: table layout */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Inscrit le</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Catégories</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.subscribers.map((sub) => (
                  <tr key={sub.uid} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{sub.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sub.displayName || "—"}</td>
                    <td className="px-6 py-4">
                      {sub.active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          Inactif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {sub.subscribedAt
                        ? new Date(sub.subscribedAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {sub.categories.length > 0
                        ? sub.categories.join(", ")
                        : "Toutes"}
                    </td>
                  </tr>
                ))}
                {data.subscribers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      Aucun abonné pour le moment
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
