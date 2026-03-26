import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-14 items-center">
          <Link href="/" className="text-lg font-bold text-primary">
            Saumya&apos;s Table
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
