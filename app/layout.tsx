import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Saumya's Table — Home-Cooked Sri Lankan Meals Delivered",
  description:
    "Order weekly home-cooked Sri Lankan meals prepared with love by Saumya. Delivery every Saturday & Sunday in Colombo.",
  metadataBase: new URL("https://saumyastable.lk"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakarta.variable} font-sans antialiased min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
