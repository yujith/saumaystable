import Link from "next/link";
import { CartSheet } from "@/components/cart-sheet";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { UserNav } from "@/components/user-nav";
import { MobileNav } from "@/components/mobile-nav";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About the Chef" },
];

// Synchronous server component - no async data fetching that blocks navigation
export function Navbar() {
  return (
    <>
      <AnnouncementBanner />
      <header className="fixed top-0 w-full z-50 glass-nav shadow-sm">
        <div className="flex justify-between items-center w-full max-w-screen-xl mx-auto px-6 py-4">
          {/* Brand */}
          <Link
            href="/"
            className="font-serif italic font-bold text-primary text-xl tracking-tight hover:opacity-80 transition-opacity"
          >
            Saumya&apos;s Table
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                className="font-headline font-semibold text-sm text-on-surface hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {/* User nav loads client-side without blocking page navigation */}
            <UserNav />
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <CartSheet />

            {/* Mobile navigation */}
            <MobileNav />
          </div>
        </div>
      </header>
      {/* Spacer so content doesn't hide behind fixed navbar */}
      <div className="h-[72px]" />
    </>
  );
}
