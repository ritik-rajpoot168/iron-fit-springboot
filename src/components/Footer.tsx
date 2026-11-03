// src/components/Footer.tsx
import Link from "next/link";
import { Flame } from "lucide-react";

const NAV = {
  Platform: [
    { label: "Home", href: "/" },
    { label: "Library", href: "/library" },
    { label: "AI Coach", href: "/generate" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  Account: [
    { label: "Login", href: "/login" },
    { label: "Sign Up", href: "/signup" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-iron mt-auto">
      <div className="max-w-[1100px] mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
              <Flame size={18} className="text-iron-red" />
              <span className="font-display font-black text-xl tracking-widest">
                IRON<span className="text-iron-red">.FIT</span>
              </span>
            </Link>
            <p className="font-body text-iron-gray text-sm leading-relaxed max-w-xs">
              A tactical AI fitness platform. Built for athletes who track what matters
              and train with intention.
            </p>
          </div>

          {/* Links */}
          {Object.entries(NAV).map(([group, links]) => (
            <div key={group}>
              <div className="font-display text-2xs font-bold tracking-widest uppercase text-iron-gray mb-4">
                {group}
              </div>
              <div className="flex flex-col gap-2.5">
                {links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="font-body text-sm text-iron-gray hover:text-iron-white transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-iron pt-6 flex flex-wrap items-center justify-between gap-4">
          <span className="font-display text-2xs tracking-widest uppercase text-iron-gray/40">
            © {new Date().getFullYear()} IRON.FIT — TRAIN. TRACK. TRANSFORM.
          </span>
          <span className="font-display text-2xs tracking-widest uppercase text-iron-gray/30">
            AI Fitness Planner & Progress Tracker
          </span>
        </div>
      </div>
    </footer>
  );
}
