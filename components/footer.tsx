import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="text-lg font-bold text-primary">
              Saumya&apos;s Table
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Home-cooked Sri Lankan meals, prepared with love and delivered weekly.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About Saumya
              </Link>
              <Link href="/menu" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Menu
              </Link>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                My Account
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Get in Touch</h3>
            <div className="space-y-2">
              <a
                href="https://wa.me/94771234567"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Saumya
              </a>
              <p className="text-sm text-muted-foreground">
                orders@saumyastable.lk
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} Saumya&apos;s Table. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
