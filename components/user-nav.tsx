"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function UserNav() {
  const [user, setUser] = useState<{ displayName: string | null; isAdmin: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, role")
          .eq("user_id", authUser.id)
          .single();
        
        setUser({
          displayName: profile?.name || authUser.email?.split("@")[0] || "Account",
          isAdmin: profile?.role === "admin",
        });
      }
      
      setLoading(false);
    }

    loadUser();
  }, []);

  if (loading) {
    // Minimal placeholder that doesn't block layout
    return (
      <div className="hidden md:flex items-center gap-2 h-8 w-24 bg-surface-container animate-pulse rounded" />
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="hidden md:flex items-center gap-2 px-5 py-2 bg-primary text-on-primary rounded-full font-headline font-bold text-sm hover:bg-primary-container transition-colors"
      >
        Log In
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/orders"
        className="hidden md:flex items-center font-headline font-semibold text-sm text-on-surface hover:text-primary transition-colors"
      >
        My Orders
      </Link>
      {user.isAdmin && (
        <Link
          href="/admin"
          className="hidden md:flex items-center font-headline font-semibold text-xs text-on-surface-variant hover:text-primary transition-colors"
        >
          Admin
        </Link>
      )}
      <Link
        href="/profile"
        className="hidden md:flex items-center gap-2 font-headline font-semibold text-sm text-on-surface hover:text-primary transition-colors"
      >
        <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>
          person
        </span>
        <span className="text-xs">{user.displayName}</span>
      </Link>
    </>
  );
}
