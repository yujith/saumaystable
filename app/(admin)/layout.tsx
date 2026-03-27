import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Users,
  Truck,
  Settings,
  Route,
} from "lucide-react";

const primaryNavLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/meals", label: "Meals", icon: UtensilsCrossed },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/delivery", label: "Delivery", icon: Truck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const deliverySubLinks = [
  {
    href: "/admin/delivery/route-planner",
    label: "Route Planner",
    icon: Route,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Admin header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center px-4 gap-4">
          <Link href="/admin" className="text-lg font-bold text-primary">
            Saumya&apos;s Table{" "}
            <span className="text-xs font-normal text-muted-foreground ml-1">
              Admin
            </span>
          </Link>
          <div className="flex-1" />
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View Site &rarr;
          </Link>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar — desktop */}
        <aside className="hidden md:flex w-56 flex-col border-r bg-muted/30 p-4 gap-1">
          {primaryNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}

          {/* Delivery sub-links — indented under Delivery */}
          {deliverySubLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 rounded-md pl-8 pr-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <link.icon className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          ))}
        </aside>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background flex items-center justify-around py-2">
          {primaryNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <link.icon className="h-5 w-5" />
              <span className="text-[10px]">{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
