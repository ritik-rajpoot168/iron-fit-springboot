// src/components/NavBar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Flame, Menu, X } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";

interface NavBarProps {
  user: { name?: string | null; email?: string | null; image?: string | null; role?: "user" | "admin" } | null;
}

export function NavBar({ user }: NavBarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.assign("/");
  };

  const navLinks = user
    ? [
        { href: "/library", label: "Library" },
        { href: "/generate", label: "AI Coach" },
        { href: "/dashboard", label: "Dashboard" },
        { href: "/progress", label: "Progress" },
        { href: "/settings", label: "Settings" },
        ...(user.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
      ]
    : [{ href: "/library", label: "Library" }];

  return (
    <>
      <nav
        className="sticky top-0 z-50 border-b border-iron"
        style={{
          background: "rgba(8,8,8,0.92)",
          backdropFilter: "blur(24px)",
        }}
      >
        <div className="flex items-center justify-between px-6 h-16 max-w-[1400px] mx-auto">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-xl font-black tracking-widest uppercase group"
          >
            <Flame
              size={20}
              className="text-iron-red transition-transform group-hover:scale-110"
            />
            <span className="text-iron-white">
              IRON<span className="text-iron-red">.FIT</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <NavLink key={l.href} href={l.href} active={pathname === l.href}>
                {l.label}
              </NavLink>
            ))}
            <div className="w-px h-4 bg-iron-border2 mx-3" />
            {user ? (
              <>
                <span className="font-display text-xs tracking-widest text-iron-gray mr-3 uppercase">
                  {(user.name ?? user.email ?? "").split(" ")[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn-ghost text-2xs"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost mr-1">
                  Login
                </Link>
                <Link href="/signup" className="btn-primary px-5 py-2 text-2xs">
                  Join Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-iron-gray-light p-2"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-iron bg-iron-card2 px-6 py-4 flex flex-col gap-2">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="font-display font-bold text-sm tracking-widest uppercase text-iron-gray-light py-2 hover:text-white transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <div className="border-t border-iron my-2" />
            {user ? (
              <button
                onClick={handleLogout}
                className="btn-ghost text-left text-2xs"
              >
                Log out
              </button>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className="btn-outline flex-1 justify-center text-xs py-2">
                  Login
                </Link>
                <Link href="/signup" className="btn-primary flex-1 justify-center text-xs py-2">
                  Join Free
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}

function NavLink({
  href,
  children,
  active,
}: {
  href: string;
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className="relative font-display text-2xs font-bold tracking-widest uppercase px-4 py-2 transition-colors"
      style={{ color: active ? "var(--iron-red)" : "var(--iron-gray-light)" }}
    >
      {children}
      {active && (
        <span
          className="absolute bottom-0 left-4 right-4 h-px bg-iron-red"
          style={{ borderRadius: "1px" }}
        />
      )}
    </Link>
  );
}
