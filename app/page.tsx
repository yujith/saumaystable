import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HowItWorks } from "@/components/how-it-works";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-24 md:py-32">
          <div className="container text-center space-y-6 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Home-Cooked Sri Lankan Meals,{" "}
              <span className="text-primary">Delivered Weekly</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Saumya prepares nutritious, traditional meals every week — rooted in
              recipes passed down from her own mother. Order by Thursday, enjoy on
              the weekend.
            </p>
            <div className="flex items-center justify-center gap-4 pt-2">
              <Link href="/menu">
                <Button size="lg">See This Week&apos;s Menu</Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg">
                  Meet Saumya
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <HowItWorks />

        {/* CTA */}
        <section className="py-16 bg-primary/5">
          <div className="container text-center space-y-4 max-w-lg">
            <h2 className="text-2xl font-bold tracking-tight">
              Ready to eat well this week?
            </h2>
            <p className="text-sm text-muted-foreground">
              Orders close every Thursday at 7 PM Sri Lanka time.
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
