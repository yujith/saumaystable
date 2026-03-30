import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "About Saumya | Saumya's Table",
  description:
    "Meet Saumya — the home cook behind Saumya's Table. Over three decades of cooking traditional Sri Lankan meals with love.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pb-24 max-w-screen-xl mx-auto px-6 relative overflow-hidden">
        {/* Organic background shapes */}
        <div className="absolute top-20 -left-20 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-40 -right-20 w-80 h-80 bg-tertiary-fixed/30 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start mb-32 pt-16">
          {/* Copy */}
          <div className="lg:col-span-7 space-y-8 order-2 lg:order-1">
            <h1 className="font-headline font-extrabold text-5xl md:text-7xl leading-tight text-on-surface tracking-tight">
              Hi, I&apos;m Saumya.{" "}
              <br />
              <span className="text-primary italic font-body font-normal">
                Welcome to my table.
              </span>
            </h1>

            <div className="space-y-6 text-lg leading-relaxed text-on-surface-variant max-w-2xl font-body">
              <p>
                My name is Saumya, and food has always been my love language.
              </p>
              <p>
                I&apos;ve been cooking for as long as I can remember — recipes I learned watching
                my own mother in the kitchen, flavours that carry the memory of every family
                meal, every celebration, every ordinary Tuesday that somehow became something
                special because of what was on the table.
              </p>
              <p>
                For over three decades, I cooked for my family. My husband and I have been
                together since 1989 — that&apos;s a lot of meals, a lot of laughter, and a lot of
                rice and curry. Our two children grew up with the smell of tempered mustard seeds
                in the morning and a pot of something simmering on the stove every evening.
              </p>
              <p>Then they grew up, got married, and moved to Melbourne.</p>
              <p>
                The kitchen got quieter. I missed feeding people. I missed the look on
                someone&apos;s face when they take the first bite of something made with real care.
              </p>
            </div>
          </div>

          {/* Chef photo */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="relative">
              <div className="aspect-[4/5] rounded-xl overflow-hidden editorial-shadow rotate-2 bg-surface-container-low relative">
                <Image
                  src="/saumya-kitchen.png"
                  alt="Saumya with her freshly prepared Sri Lankan meals"
                  fill
                  className="object-cover object-center"
                  priority
                  quality={85}
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-secondary-container rounded-full -z-10" />
            </div>
          </div>
        </section>

        {/* ── Pull Quote ───────────────────────────────────────── */}
        <section className="mb-32 text-center max-w-4xl mx-auto py-16 px-8 bg-surface-container-low rounded-xl relative">
          <span
            className="material-symbols-outlined text-primary-container text-6xl opacity-30 absolute top-8 left-8"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            format_quote
          </span>
          <blockquote className="font-body text-3xl md:text-4xl italic text-on-surface leading-snug">
            &ldquo;I wanted to create something that felt less like a transaction and more
            like a letter from a dear friend.&rdquo;
          </blockquote>
          <p className="mt-8 font-headline font-bold text-primary tracking-widest uppercase text-sm">
            That&apos;s how Saumya&apos;s Table was born.
          </p>
        </section>

        {/* ── Story continued ──────────────────────────────────── */}
        <section className="mb-24 max-w-2xl mx-auto space-y-6 font-body text-lg leading-relaxed text-on-surface-variant">
          <p>
            This is not a restaurant. It&apos;s not a catering company. It&apos;s my home kitchen,
            run by one person who genuinely loves to cook — preparing meals every week for people
            who deserve to eat well, even when life is busy.
          </p>
          <p>
            Every dish I make is rooted in traditional Sri Lankan cooking — the recipes my mother
            taught me, refined over thirty-five years of feeding a family. Nutritious, balanced,
            made from scratch with fresh ingredients. No shortcuts. No preservatives. No mystery.
            Just real food, made with love.
          </p>
          <p>
            Orders close every Thursday at 7 PM. I cook through the week and deliver on Saturday
            or Sunday. That&apos;s the rhythm — simple, honest, and personal. Just like the food.
          </p>

          {/* Family detail badge */}
          <div className="flex items-center justify-center py-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2.5 text-sm text-primary font-headline font-semibold">
              Married since 1989 &middot; Two kids in Melbourne &middot; Cooking since before they were born
            </div>
          </div>
        </section>

        {/* ── Bento Grid: Beyond the Kitchen ───────────────────── */}
        <section className="mb-32">
          <h2 className="font-headline text-3xl font-bold text-on-surface mb-12 text-center">
            Beyond the Kitchen
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface-container-lowest p-10 rounded-lg editorial-shadow space-y-4">
              <span className="material-symbols-outlined text-tertiary text-4xl">family_history</span>
              <h3 className="font-headline text-xl font-bold text-on-surface">Roots &amp; Heritage</h3>
              <p className="text-on-surface-variant font-body">
                Every dish is a tribute to my mother&apos;s patience. I live with my husband, and
                our kitchen has always been the heart of our home.
              </p>
            </div>

            <div className="bg-surface-container p-10 rounded-lg space-y-4">
              <span className="material-symbols-outlined text-tertiary text-4xl">eco</span>
              <h3 className="font-headline text-xl font-bold text-on-surface">Nature&apos;s Rhythm</h3>
              <p className="text-on-surface-variant font-body">
                We source as much produce as possible locally. If it&apos;s not in season, it&apos;s
                not on the table. We believe in slow growth and zero-waste packaging.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-10 rounded-lg editorial-shadow space-y-4">
              <span className="material-symbols-outlined text-tertiary text-4xl">local_cafe</span>
              <h3 className="font-headline text-xl font-bold text-on-surface">Evening Rituals</h3>
              <p className="text-on-surface-variant font-body">
                When the kitchen goes quiet, you&apos;ll find me with a cup of Ceylon tea and a
                well-worn notebook, sketching out the next season&apos;s culinary experiments.
              </p>
            </div>
          </div>
        </section>

        {/* ── Sign-off ─────────────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center bg-surface-container-low p-8 md:p-16 rounded-xl mb-16">
          <div className="h-72 rounded-lg bg-surface-container overflow-hidden relative">
            <Image
              src="/saumya-kitchen.png"
              alt="Saumya in her kitchen"
              fill
              className="object-cover object-top"
              quality={75}
            />
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="font-headline text-3xl font-bold text-on-surface">Let&apos;s connect.</h2>
              <p className="font-body text-lg text-on-surface-variant">
                Whether you have a question about an ingredient or just want to share a food
                memory, my digital door is always open.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://wa.me/94771234567"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary hover:bg-primary-container text-on-primary font-label font-bold px-8 py-4 rounded-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-md"
              >
                <span className="material-symbols-outlined">chat</span>
                Message on WhatsApp
              </a>
              <Link
                href="/menu"
                className="bg-surface-container-lowest border-2 border-outline-variant text-on-surface font-label font-bold px-8 py-4 rounded-lg hover:bg-surface-variant transition-all active:scale-95 text-center"
              >
                See This Week&apos;s Menu
              </Link>
            </div>

            <div className="pt-8 border-t border-outline-variant/30 italic font-body text-primary text-xl">
              With warmth and spice,
              <br />
              <span className="font-headline font-black text-2xl not-italic">Saumya</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
