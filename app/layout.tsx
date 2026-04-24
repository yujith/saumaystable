import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Serif } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-noto",
  style: ["normal", "italic"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Saumya's Table — Home-Cooked Sri Lankan Meals Delivered",
  description:
    "Order weekly home-cooked Sri Lankan meals prepared with love by Saumya. Delivery every Saturday & Sunday in Colombo.",
  metadataBase: new URL("https://saumyastable.org"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Material Symbols Outlined — needed for icons in Navbar, HowItWorks, MealCard, etc. */}
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body
        className={`${plusJakarta.variable} ${notoSerif.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-on-surface`}
      >
        {children}
      </body>
    </html>
  );
}
