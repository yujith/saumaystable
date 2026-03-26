import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HowItWorks } from "@/components/how-it-works";
import { createClient } from "@/lib/supabase/server";
import { CountdownTimer } from "@/components/countdown-timer";

export const revalidate = 60;

export default async function Home() {
  // Fetch a few featured meals for the specials section
  const supabase = createClient();
  const { data: featuredMeals } = await supabase
    .from("meals")
    .select("*")
    .eq("is_available", true)
    .order("sort_order", { ascending: true })
    .limit(3);

  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ────────────────────────────────────────────────── */}
        <section className="relative w-full min-h-[870px] flex items-center overflow-hidden px-6 lg:px-24">
          {/* Background image */}
          <div className="absolute inset-0 z-0">
            {/* DEV PLACEHOLDER — replace with real Saumya kitchen photo before launch */}
            <div className="w-full h-full bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
              <span className="text-[12rem] opacity-10">🍛</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
          </div>

          {/* Hero copy */}
          <div className="relative z-10 max-w-2xl animate-fade-in-up">
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-container text-primary font-label text-xs font-bold mb-6 tracking-widest uppercase">
              Established in the Home Kitchen
            </span>
            <h1 className="font-headline text-5xl lg:text-7xl font-extrabold text-on-surface leading-[1.1] mb-6">
              Real food.{" "}
              <br />
              Real care.{" "}
              <br />
              <span className="text-primary italic font-body font-normal">Every week.</span>
            </h1>
            <p className="font-body text-xl text-on-surface-variant mb-10 leading-relaxed max-w-lg">
              Experience the warmth of home-cooked Sri Lankan meals, prepared with seasonal
              ingredients and delivered fresh to your doorstep.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/menu"
                className="px-8 py-4 bg-primary text-on-primary rounded-lg font-label font-bold text-base shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
              >
                Explore This Week&apos;s Menu
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 bg-surface-container-highest text-on-surface rounded-lg font-label font-bold text-base hover:bg-surface-container-high transition-colors"
              >
                Our Story
              </Link>
            </div>
          </div>

          {/* Floating glass countdown */}
          <div className="absolute bottom-12 right-6 lg:right-24 z-20">
            <div className="glass-card p-6 rounded-xl sun-shadow border border-white/20 flex flex-col items-center">
              <span className="font-label text-xs font-bold text-primary tracking-[0.2em] mb-2 uppercase">
                Next Batch Closes In
              </span>
              <HeroTimer />
            </div>
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────────────── */}
        <HowItWorks />

        {/* ── This Week's Specials ──────────────────────────────── */}
        <section className="py-24 bg-surface-container-low overflow-hidden">
          <div className="max-w-screen-xl mx-auto px-6 mb-12 flex justify-between items-end">
            <div>
              <h2 className="font-headline text-4xl font-bold text-on-surface mb-2">
                This Week&apos;s Specials
              </h2>
              <p className="font-body text-on-surface-variant italic">
                Fresh from the market to your heart.
              </p>
            </div>
            <Link
              href="/menu"
              className="flex items-center gap-2 text-primary font-label font-bold hover:underline"
            >
              View full menu{" "}
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>

          <div className="max-w-screen-xl mx-auto px-6 grid md:grid-cols-3 gap-8">
            {featuredMeals && featuredMeals.length > 0 ? (
              featuredMeals.map((meal) => (
                <SpecialCard key={meal.id} meal={meal} />
              ))
            ) : (
              // Fallback placeholder cards
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-surface-container-lowest rounded-xl overflow-hidden sun-shadow"
                >
                  <div className="h-64 bg-surface-container flex items-center justify-center text-4xl">
                    🍛
                  </div>
                  <div className="p-8">
                    <p className="font-body text-on-surface-variant text-sm">
                      Check back soon — this week&apos;s menu is being prepared.
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ── Testimonial ──────────────────────────────────────── */}
        <section className="py-24 px-6 max-w-screen-lg mx-auto">
          <div className="bg-tertiary rounded-xl p-12 lg:p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-10 -mb-10" />
            <div className="relative z-10 text-center text-white">
              <span
                className="material-symbols-outlined text-6xl text-white/20 mb-6 block"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                format_quote
              </span>
              <h3 className="font-body text-2xl lg:text-3xl italic leading-snug mb-10">
                &ldquo;The curry was like a warm hug. You can taste the care in every spice.
                It&rsquo;s not just delivery; it&rsquo;s like Saumya is part of our family now.&rdquo;
              </h3>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden bg-white/10 flex items-center justify-center">
                  <span className="text-xl">👤</span>
                </div>
                <div className="text-left">
                  <p className="font-headline font-bold">A Happy Customer</p>
                  <p className="font-label text-xs text-white/70 tracking-widest uppercase">
                    Weekly Regular
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── About CTA ────────────────────────────────────────── */}
        <section className="py-24 px-6 grid md:grid-cols-2 gap-16 items-center max-w-screen-xl mx-auto">
          <div className="order-2 md:order-1">
            <div className="relative">
              <div className="h-80 rounded-xl sun-shadow bg-surface-container-low flex items-center justify-center overflow-hidden">
                {/* DEV PLACEHOLDER — replace with spice flat-lay photo */}
                <span className="text-[8rem] opacity-20">🌿</span>
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-secondary-container rounded-lg -z-10" />
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="font-headline text-4xl font-bold text-on-surface mb-6">
              Beyond the Kitchen
            </h2>
            <p className="font-body text-lg text-on-surface-variant mb-8 leading-relaxed">
              Saumya&apos;s Table started with a single bowl of curry shared with a neighbour.
              Today, it remains a labour of love — dedicated to sustainability and the belief
              that good food can nourish both the body and the community.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-3 font-label font-extrabold text-primary hover:gap-5 transition-all"
            >
              MEET THE CHEF{" "}
              <span className="material-symbols-outlined">arrow_right_alt</span>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

/* ── Sub-components ──────────────────────────────────────────────── */

function HeroTimer() {
  // Client-side logic is in CountdownTimer; here we show a static placeholder
  // that gets replaced once JS hydrates. Using a simple server-rendered version.
  return (
    <span className="font-headline text-4xl font-extrabold text-primary tracking-tighter animate-breathing">
      Loading…
    </span>
  );
}

function SpecialCard({ meal }: { meal: { name: string; price_lkr: number; description?: string | null; tags?: string[] | null; image_url?: string | null } }) {
  const formatLKR = (amount: number) =>
    `LKR ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden sun-shadow group">
      <div className="h-64 overflow-hidden bg-surface-container-low">
        {meal.image_url ? (
          <Image
            src={meal.image_url}
            alt={meal.name}
            width={400}
            height={256}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🍛</div>
        )}
      </div>
      <div className="p-8">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-body text-xl font-bold text-on-surface">{meal.name}</h3>
          <span className="text-primary font-headline font-extrabold">{formatLKR(meal.price_lkr)}</span>
        </div>
        {meal.description && (
          <p className="font-body text-on-surface-variant text-sm mb-6 line-clamp-2 leading-relaxed">
            {meal.description}
          </p>
        )}
        {meal.tags && meal.tags.length > 0 && (
          <div className="flex gap-2 mb-8 flex-wrap">
            {(meal.tags as string[]).slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-tertiary/10 text-tertiary rounded-full text-[10px] font-label font-bold uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <Link
          href="/menu"
          className="block w-full py-3 bg-secondary-container text-on-secondary-container rounded-lg font-label font-bold text-center hover:bg-primary hover:text-on-primary transition-all"
        >
          Add to Table
        </Link>
      </div>
    </div>
  );
}
