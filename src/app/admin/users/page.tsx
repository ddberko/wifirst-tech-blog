"use client";

import { useState, useEffect } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from "firebase/app";
import AuthGuard from "@/components/AuthGuard";
import { useRole, Role } from "@/lib/useRole";
import Link from "next/link";

interface ManagedUser {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  addedAt: string | null;
  updatedAt: string | null;
}

const ROLE_BADGES: Record<string, { bg: string; text: string }> = {
  reader: { bg: "bg-gray-100", text: "text-gray-700" },
  publisher: { bg: "bg-blue-100", text: "text-[#0066CC]" },
  admin: { bg: "bg-purple-100", text: "text-purple-700" },
};

function UsersContent() {
  const { user, role } = useRole();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Add user form
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<Role>("reader");
  const [addingUser, setAddingUser] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const functions = getFunctions(getApp(), "us-central1");

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
        await user.getIdToken(true);
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
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
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

  // Show initialize button if current user has no role yet
  if (!role && user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Initialiser l&apos;administration</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Aucun administrateur n&apos;est configure. Cliquez ci-dessous pour vous promouvoir administrateur.
          </p>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <button
            onClick={handleInitializeAdmin}
            disabled={actionLoading === "init"}
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50 inline-flex items-center gap-2"
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
              "Initialiser admin"
            )}
          </button>
        </div>
      </div>
    );
  }

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
              const badge = ROLE_BADGES[u.role] || ROLE_BADGES.reader;
              return (
                <div key={u.uid} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium text-gray-600">
                          {(u.displayName || u.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{u.email}</p>
                        {u.displayName && (
                          <p className="text-xs text-gray-500 truncate">{u.displayName}</p>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${badge.bg} ${badge.text} shrink-0 ml-2`}>
                      {u.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.uid, e.target.value as Role)}
                      disabled={actionLoading === u.uid}
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white"
                    >
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
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date ajout</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => {
                  const badge = ROLE_BADGES[u.role] || ROLE_BADGES.reader;
                  return (
                    <tr key={u.uid} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-sm font-medium text-gray-600">
                              {(u.displayName || u.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
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
                          {u.role}
                        </span>
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
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.uid, e.target.value as Role)}
                            disabled={actionLoading === u.uid}
                            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-[#0066CC] focus:border-transparent outline-none disabled:opacity-50"
                          >
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
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
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
  return (
    <AuthGuard requiredRole="admin">
      <UsersContent />
    </AuthGuard>
  );
}
