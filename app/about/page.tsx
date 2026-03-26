import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HowItWorks } from "@/components/how-it-works";

export const metadata: Metadata = {
  title: "About Saumya | Saumya's Table",
  description:
    "Meet Saumya — the home cook behind Saumya's Table. Over three decades of cooking traditional Sri Lankan meals with love.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative w-full h-[50vh] min-h-[400px] bg-muted">
          {/* DEV PLACEHOLDER — replace with real photo of Saumya before launch */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
          <div className="relative z-10 flex items-center justify-center h-full">
            <h1 className="text-3xl md:text-5xl font-bold text-white text-center px-4 leading-tight">
              Hi, I&apos;m Saumya.
              <br />
              Welcome to my table.
            </h1>
          </div>
        </section>

        {/* Story Section — PRD Section 3.2 copy, used verbatim */}
        <section className="py-16 md:py-20">
          <div className="container max-w-2xl space-y-6">
            <p className="text-base leading-relaxed text-foreground">
              My name is Saumya, and food has always been my love language.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              I&apos;ve been cooking for as long as I can remember — recipes I learned watching
              my own mother in the kitchen, flavours that carry the memory of every family meal,
              every celebration, every ordinary Tuesday that somehow became something special
              because of what was on the table.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              For over three decades, I cooked for my family. My husband and I have been together
              since 1989 — that&apos;s a lot of meals, a lot of laughter, and a lot of rice and curry.
              Our two children grew up with the smell of tempered mustard seeds in the morning and
              a pot of something simmering on the stove every evening.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Then they grew up, got married, and moved to Melbourne.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              The kitchen got quieter. I missed feeding people. I missed the look on someone&apos;s
              face when they take the first bite of something made with real care.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              So I started cooking for the people around me — friends, neighbours, working families
              who wanted a proper home-cooked meal but simply didn&apos;t have the time to make one
              themselves.
            </p>

            {/* Pull Quote */}
            <blockquote className="border-l-4 border-primary pl-6 py-4 my-8">
              <p className="text-lg md:text-xl font-medium italic text-foreground">
                That&apos;s how Saumya&apos;s Table was born.
              </p>
            </blockquote>

            <p className="text-base leading-relaxed text-muted-foreground">
              This is not a restaurant. It&apos;s not a catering company. It&apos;s my home kitchen,
              run by one person who genuinely loves to cook — preparing meals every week for people
              who deserve to eat well, even when life is busy.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Every dish I make is rooted in traditional Sri Lankan cooking — the recipes my mother
              taught me, the ones I&apos;ve refined over thirty-five years of feeding a family.
              Nutritious, balanced, made from scratch with fresh ingredients. No shortcuts. No
              preservatives. No mystery. Just real food, made with love.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Orders close every Thursday at 7 PM. I cook through the week and deliver on Saturday
              or Sunday. That&apos;s the rhythm — simple, honest, and personal. Just like the food.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              If you have any questions, or you just want to know what&apos;s on the menu this week,
              my WhatsApp is always open. I&apos;d love to cook for you.
            </p>

            {/* Family detail badge */}
            <div className="flex items-center justify-center py-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2.5 text-sm text-primary font-medium">
                Married since 1989 &middot; Two kids in Melbourne &middot; Cooking since before they were born
              </div>
            </div>
          </div>
        </section>

        {/* How It Works — reused component */}
        <div className="bg-muted/40">
          <HowItWorks />
        </div>

        {/* Personal Sign-Off */}
        <section className="py-16 md:py-20">
          <div className="container max-w-md text-center space-y-6">
            {/* Circular Saumya photo placeholder */}
            <div className="mx-auto h-28 w-28 rounded-full bg-muted border-4 border-primary/20 flex items-center justify-center overflow-hidden">
              {/* DEV PLACEHOLDER — replace with real circular Saumya photo before launch */}
              <span className="text-3xl">👩‍🍳</span>
            </div>
            <p className="text-base text-muted-foreground">
              Have a question? Message me directly.
            </p>
            <a
              href="https://wa.me/94771234567"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="gap-2">
                <MessageCircle className="h-5 w-5" />
                Message Saumya on WhatsApp
              </Button>
            </a>
          </div>
        </section>

        {/* CTA — See This Week's Menu */}
        <section className="py-16 bg-primary/5">
          <div className="container text-center space-y-4 max-w-lg">
            <h2 className="text-2xl font-bold tracking-tight">
              See This Week&apos;s Menu
            </h2>
            <p className="text-sm text-muted-foreground">
              Browse what Saumya is cooking this week and place your order before Thursday.
            </p>
            <Link href="/menu">
              <Button size="lg">Browse the Menu</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
