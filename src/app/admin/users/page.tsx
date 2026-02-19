"use client";

import { useState, useEffect } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from "firebase/app";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRole, Role } from "@/lib/useRole";
import Link from "next/link";

interface ManagedUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: string | null;
  lastSignIn: string | null;
  addedAt: string | null;
  updatedAt: string | null;
}

const ROLE_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  reader: { bg: "bg-gray-100", text: "text-gray-700", label: "Reader" },
  publisher: { bg: "bg-blue-100", text: "text-[#0066CC]", label: "Publisher" },
  admin: { bg: "bg-purple-100", text: "text-purple-700", label: "Admin" },
};

const NO_ROLE_BADGE = { bg: "bg-gray-50", text: "text-gray-400", label: "Aucun r\u00f4le" };

function UserAvatar({ user }: { user: ManagedUser }) {
  const [imgError, setImgError] = useState(false);
  const initials = (user.displayName || user.email).charAt(0).toUpperCase();

  if (user.photoURL && !imgError) {
    return (
      <img
        src={user.photoURL}
        alt={user.displayName || user.email}
        className="w-8 h-8 rounded-full object-cover shrink-0"
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
      <span className="text-sm font-medium text-gray-600">{initials}</span>
    </div>
  );
}

function UsersContent() {
  const { user, role, loading: roleLoading } = useRole();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Add user form
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<Role>("reader");
  const [addingUser, setAddingUser] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [loginError, setLoginError] = useState<string | null>(null);

  const functions = getFunctions(getApp(), "us-central1");

  async function handleLogin() {
    setLoginError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login failed:", err);
      setLoginError(err instanceof Error ? err.message : "Authentication failed");
    }
  }

  useEffect(() => {
    if (role === "admin") {
      loadUsers();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      const listFn = httpsCallable(functions, "listManagedUsers");
      const result = await listFn({});
      const data = result.data as { users: ManagedUser[] };
      setUsers(data.users);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  }

  async function handleInitializeAdmin() {
    setActionLoading("init");
    setError(null);
    try {
      const initFn = httpsCallable(functions, "initializeAdmin");
      await initFn({});
      // Force token refresh to get the new claim
      if (user) {
        await user.getIdTokenResult(true);
      }
      window.location.reload();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'initialisation";
      setError(message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRoleChange(uid: string, newRoleValue: Role) {
    setActionLoading(uid);
    try {
      const setRoleFn = httpsCallable(functions, "setUserRole");
      await setRoleFn({ uid, role: newRoleValue });
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, role: newRoleValue } : u))
      );
    } catch (err) {
      console.error("Error changing role:", err);
      setError("Erreur lors du changement de role");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRemoveUser(uid: string) {
    if (!confirm("Supprimer cet utilisateur et ses permissions ?")) return;
    setActionLoading(uid);
    try {
      const removeFn = httpsCallable(functions, "removeUserRole");
      await removeFn({ uid });
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, role: null } : u))
      );
    } catch (err) {
      console.error("Error removing user:", err);
      setError("Erreur lors de la suppression");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setAddingUser(true);
    setAddError(null);
    try {
      // Look up user by email
      const getUserFn = httpsCallable(functions, "getUserByEmail");
      const result = await getUserFn({ email: newEmail });
      const foundUser = result.data as { uid: string; email: string; displayName: string };

      // Set their role
      const setRoleFn = httpsCallable(functions, "setUserRole");
      await setRoleFn({ uid: foundUser.uid, role: newRole });

      // Refresh list
      await loadUsers();
      setNewEmail("");
      setNewRole("reader");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Utilisateur introuvable";
      setAddError(message);
    } finally {
      setAddingUser(false);
    }
  }

  // 0. Loading state
  if (roleLoading) {
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

  // 1. Not authenticated → login screen
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 text-center">
            <div className="w-16 h-16 bg-[#0066CC] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200/50">
              <span className="text-white font-bold text-2xl">W</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Wifirst Tech Blog</h1>
            <p className="text-gray-500 mb-8">
              Internal engineering insights and technical documentation.
              <br />
              <span className="text-sm text-gray-400">Sign in with your Wifirst account to continue.</span>
            </p>
            {loginError && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-sm text-red-600">{loginError}</p>
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
            <p className="mt-6 text-xs text-gray-400">Access restricted to Wifirst employees</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated but no role → bootstrap screen
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 text-center">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Initialisation de l&apos;administration</h1>
            <p className="text-gray-500 mb-8 text-sm">
              Aucun administrateur configur&eacute;. Cliquez pour vous promouvoir administrateur.
            </p>
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <button
              onClick={handleInitializeAdmin}
              disabled={actionLoading === "init"}
              className="px-6 py-3 bg-[#0066CC] text-white font-semibold rounded-xl hover:bg-[#0052a3] shadow-lg shadow-blue-200/50 transition-all active:scale-[0.98] disabled:opacity-50 inline-flex items-center gap-2"
            >
              {actionLoading === "init" ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Initialisation...
                </>
              ) : (
                "Devenir administrateur"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated but non-admin role → access denied
  if (role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acc&egrave;s refus&eacute;</h1>
          <p className="text-gray-500 mb-6">
            Votre r&ocirc;le actuel est <span className="font-semibold text-gray-700">{role}</span>. Seuls les administrateurs peuvent acc&eacute;der &agrave; cette page.
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

  // 4. Authenticated with admin role → full user management UI
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p className="text-gray-500 mt-1 text-sm">Gerez les roles et permissions</p>
        </div>
        <Link
          href="/admin"
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#0066CC] rounded-lg hover:bg-blue-50 transition-all self-start"
        >
          &larr; Retour admin
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Add user form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ajouter un utilisateur</h2>
        <form onSubmit={handleAddUser} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div className="flex-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="utilisateur@wifirst.fr"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0066CC] focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
          <div className="sm:w-40">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as Role)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0066CC] focus:border-transparent outline-none transition-all text-sm bg-white"
            >
              <option value="reader">Reader</option>
              <option value="publisher">Publisher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={addingUser}
            className="px-6 py-2.5 bg-[#0066CC] text-white font-medium rounded-xl hover:bg-[#0052a3] transition-all disabled:opacity-50 text-sm inline-flex items-center justify-center gap-2"
          >
            {addingUser ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Ajout...
              </>
            ) : (
              "Ajouter"
            )}
          </button>
        </form>
        {addError && (
          <p className="text-sm text-red-600 mt-3">{addError}</p>
        )}
      </div>

      {/* Users table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 text-gray-500">
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Chargement...
          </div>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="md:hidden space-y-3">
            {users.map((u) => {
              const badge = u.role ? (ROLE_BADGES[u.role] || NO_ROLE_BADGE) : NO_ROLE_BADGE;
              return (
                <div key={u.uid} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar user={u} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{u.email}</p>
                        {u.displayName && (
                          <p className="text-xs text-gray-500 truncate">{u.displayName}</p>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${badge.bg} ${badge.text} shrink-0 ml-2`}>
                      {badge.label}
                    </span>
                  </div>
                  {u.lastSignIn && (
                    <p className="text-xs text-gray-400 mb-2">
                      Derni&egrave;re connexion : {new Date(u.lastSignIn).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <select
                      value={u.role || ""}
                      onChange={(e) => handleRoleChange(u.uid, e.target.value as Role)}
                      disabled={actionLoading === u.uid}
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white"
                    >
                      <option value="" disabled>Choisir un r&ocirc;le</option>
                      <option value="reader">Reader</option>
                      <option value="publisher">Publisher</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => handleRemoveUser(u.uid)}
                      disabled={actionLoading === u.uid}
                      className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
            {users.length === 0 && (
              <div className="text-center py-12 text-gray-400">Aucun utilisateur</div>
            )}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Derni&egrave;re connexion</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date ajout</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => {
                  const badge = u.role ? (ROLE_BADGES[u.role] || NO_ROLE_BADGE) : NO_ROLE_BADGE;
                  return (
                    <tr key={u.uid} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={u} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900">{u.email}</p>
                            {u.displayName && (
                              <p className="text-xs text-gray-500">{u.displayName}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {u.lastSignIn
                          ? new Date(u.lastSignIn).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "\u2014"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {u.addedAt
                          ? new Date(u.addedAt).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "\u2014"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={u.role || ""}
                            onChange={(e) => handleRoleChange(u.uid, e.target.value as Role)}
                            disabled={actionLoading === u.uid}
                            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-[#0066CC] focus:border-transparent outline-none disabled:opacity-50"
                          >
                            <option value="" disabled>Choisir un r&ocirc;le</option>
                            <option value="reader">Reader</option>
                            <option value="publisher">Publisher</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => handleRemoveUser(u.uid)}
                            disabled={actionLoading === u.uid}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Supprimer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      Aucun utilisateur
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

export default function UsersPage() {
  return <UsersContent />;
}
