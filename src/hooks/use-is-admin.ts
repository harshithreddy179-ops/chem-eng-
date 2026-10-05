"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

/**
 * Whether the current visitor is a signed-in admin. Purely cosmetic —
 * it only reveals the "Admin" nav entry. Real protection is server-side.
 */
export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const db = getBrowserClient();
    if (!db) return;
    let cancelled = false;
    db.auth.getSession().then(async ({ data }) => {
      if (!data.session || cancelled) return;
      const { data: ok } = await db.rpc("is_admin");
      if (!cancelled) setIsAdmin(ok === true);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return isAdmin;
}
