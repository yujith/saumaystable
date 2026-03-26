import Link from "next/link";
import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CartSheet } from "@/components/cart-sheet";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { createClient } from "@/lib/supabase/server";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/menu", label: "Menu" },
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
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary">
          Saumya&apos;s Table
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <CartSheet />
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/orders"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                My Orders
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Admin
                </Link>
              )}
              <Link href="/profile">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {displayName}
                </Button>
              </Link>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">
                Log In
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile nav */}
        <div className="flex items-center gap-2 md:hidden">
          <CartSheet />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-base font-medium text-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t space-y-3">
                  {user ? (
                    <>
                      <Link href="/orders">
                        <Button variant="ghost" className="w-full" size="sm">
                          My Orders
                        </Button>
                      </Link>
                      <Link href="/profile">
                        <Button variant="outline" className="w-full gap-1.5" size="sm">
                          <User className="h-3.5 w-3.5" />
                          {displayName}
                        </Button>
                      </Link>
                      {isAdmin && (
                        <Link href="/admin">
                          <Button variant="ghost" className="w-full" size="sm">
                            Admin Panel
                          </Button>
                        </Link>
                      )}
                    </>
                  ) : (
                    <Link href="/login">
                      <Button className="w-full" size="sm">
                        Log In
                      </Button>
                    </Link>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
    </>
  );
}
