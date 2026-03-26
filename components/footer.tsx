import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-on-surface text-surface py-20 px-6 mt-12">
      <div className="max-w-screen-xl mx-auto grid md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="col-span-2">
          <h2 className="font-serif italic font-bold text-primary-container text-3xl mb-6">
            Saumya&apos;s Table
          </h2>
          <p className="font-body text-surface/60 max-w-md mb-8 leading-relaxed">
            The Culinary Letter — a weekly invitation into our home, through the flavours of Sri Lanka.
          </p>
          <div className="flex gap-4">
            <a
              href="https://wa.me/94771234567"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-surface/20 flex items-center justify-center hover:bg-primary-container hover:border-primary-container transition-colors"
              aria-label="WhatsApp"
            >
              <span className="material-symbols-outlined text-sm">chat</span>
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full border border-surface/20 flex items-center justify-center hover:bg-primary-container hover:border-primary-container transition-colors"
              aria-label="Instagram"
            >
              <span className="material-symbols-outlined text-sm">photo_camera</span>
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full border border-surface/20 flex items-center justify-center hover:bg-primary-container hover:border-primary-container transition-colors"
              aria-label="Facebook"
            >
              <span className="material-symbols-outlined text-sm">public</span>
            </a>
          </div>
        </div>

        {/* Explore */}
        <div>
          <h6 className="font-headline font-bold mb-6">Explore</h6>
          <ul className="space-y-4 font-label text-sm text-surface/70">
            <li>
              <Link href="/menu" className="hover:text-primary-container transition-colors">
                Weekly Menu
              </Link>
            </li>
            <li>
              <Link href="/#how-it-works" className="hover:text-primary-container transition-colors">
                How It Works
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-primary-container transition-colors">
                My Orders
              </Link>
            </li>
          </ul>
        </div>

        {/* Heart */}
        <div>
          <h6 className="font-headline font-bold mb-6">Heart</h6>
          <ul className="space-y-4 font-label text-sm text-surface/70">
            <li>
              <Link href="/about" className="hover:text-primary-container transition-colors">
                About the Chef
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-primary-container transition-colors">
                My Account
              </Link>
            </li>
            <li>
              <a
                href="mailto:orders@saumyastable.lk"
                className="hover:text-primary-container transition-colors"
              >
                Support
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto mt-20 pt-8 border-t border-surface/10 text-center font-label text-[10px] text-surface/40 uppercase tracking-widest">
        © {new Date().getFullYear()} Saumya&apos;s Table. Handcrafted with Care.
      </div>
    </footer>
  );
}
