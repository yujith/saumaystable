"use client";

import Link from "next/link";
import { useState } from "react";
import { X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About the Chef" },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden text-primary hover:opacity-80 transition-opacity"
        aria-label="Open menu"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Slide-out menu */}
          <div className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-50 md:hidden shadow-xl animate-in slide-in-from-right duration-200">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <span className="font-serif italic font-bold text-primary">
                  Saumya&apos;s Table
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-primary hover:opacity-80 transition-opacity"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex flex-col p-4 gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={true}
                    onClick={() => setIsOpen(false)}
                    className="font-headline font-semibold text-lg text-on-surface hover:text-primary transition-colors py-3 px-4 rounded-lg hover:bg-surface-container"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Bottom section with My Orders link */}
              <div className="mt-auto p-4 border-t">
                <Link
                  href="/orders"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 font-headline font-semibold text-on-surface hover:text-primary transition-colors py-3 px-4 rounded-lg hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined text-primary">
                    package_2
                  </span>
                  My Orders
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 font-headline font-semibold text-on-surface hover:text-primary transition-colors py-3 px-4 rounded-lg hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined text-primary">
                    person
                  </span>
                  My Profile
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
