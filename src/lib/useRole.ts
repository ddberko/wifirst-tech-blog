"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export type Role = "reader" | "publisher" | "admin";

interface UseRoleReturn {
  user: User | null;
  role: Role | null;
  loading: boolean;
  hasRole: (required: Role | Role[]) => boolean;
}

export function useRole(): UseRoleReturn {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const tokenResult = await currentUser.getIdTokenResult();
          const claimRole = tokenResult.claims.role as Role | undefined;
          setRole(claimRole || null);
        } catch {
          setRole(null);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  function hasRole(required: Role | Role[]): boolean {
    if (!role) return false;
    if (Array.isArray(required)) {
      return required.includes(role);
    }
    return role === required;
  }

  return { user, role, loading, hasRole };
}
