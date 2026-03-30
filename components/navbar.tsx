import Link from "next/link";
import Image from "next/image";
import { CartSheet } from "@/components/cart-sheet";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { createClient } from "@/lib/supabase/server";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About the Chef" },
];

export async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName: string | null = null;
  let isAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, role")
      .eq("user_id", user.id)
      .single();
    displayName = profile?.name || user.email?.split("@")[0] || "Account";
    isAdmin = profile?.role === "admin";
  }

  return (
    <>
      <AnnouncementBanner />
      <header className="fixed top-0 w-full z-50 glass-nav shadow-sm">
        <div className="flex justify-between items-center w-full max-w-screen-xl mx-auto px-6 py-4">
          {/* Brand */}
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png"
              alt="Saumya's Table"
              width={140}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-headline font-semibold text-sm text-on-surface hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <Link
                href="/orders"
                className="font-headline font-semibold text-sm text-on-surface hover:text-primary transition-colors"
              >
                My Orders
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="font-headline font-semibold text-xs text-on-surface-variant hover:text-primary transition-colors"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <CartSheet />
            {user ? (
              <Link
                href="/profile"
                className="hidden md:flex items-center gap-2 font-headline font-semibold text-sm text-on-surface hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>
                  person
                </span>
                <span className="text-xs">{displayName}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex items-center gap-2 px-5 py-2 bg-primary text-on-primary rounded-full font-headline font-bold text-sm hover:bg-primary-container transition-colors"
              >
                Log In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button className="md:hidden text-primary hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </header>
      {/* Spacer so content doesn't hide behind fixed navbar */}
      <div className="h-[72px]" />
    </>
  );
}
