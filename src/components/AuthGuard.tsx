"use client";

import { useEffect, useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { onAuthStateChanged, signInWithPopup, User } from "firebase/auth";
import type { Role } from "@/lib/useRole";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: Role | Role[];
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && requiredRole) {
        try {
          const tokenResult = await currentUser.getIdTokenResult();
          const claimRole = tokenResult.claims.role as Role | undefined;
          setRole(claimRole || null);
        } catch {
          setRole(null);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [requiredRole]);

  async function handleLogin() {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login failed:", err);
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 text-gray-400">
            <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium">Checking authentication...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 text-center">
            {/* Logo */}
            <div className="w-16 h-16 bg-[#0066CC] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200/50">
              <span className="text-white font-bold text-2xl">W</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Wifirst Tech Blog
            </h1>
            <p className="text-gray-500 mb-8">
              Internal engineering insights and technical documentation.
              <br />
              <span className="text-sm text-gray-400">Sign in with your Wifirst account to continue.</span>
            </p>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full inline-flex items-center justify-center gap-3 px-6 py-3 bg-[#0066CC] text-white font-semibold rounded-xl hover:bg-[#0052a3] shadow-lg shadow-blue-200/50 transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>

            <p className="mt-6 text-xs text-gray-400">
              Access restricted to Wifirst employees
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Role check: if requiredRole is specified, verify the user has the right role
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!role || !roles.includes(role)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full mx-4 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acces refuse</h1>
            <p className="text-gray-500 mb-6">
              Vous n&apos;avez pas les permissions necessaires pour acceder a cette page.
            </p>
            <a
              href="/admin"
              className="text-[#0066CC] hover:underline text-sm font-medium"
            >
              Retour au dashboard
            </a>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
