// src/app/page.tsx
import { NavBar } from "@/components/NavBar";
import { HeroSection } from "@/components/HeroSection";
import { WeaponGrid } from "@/components/WeaponGrid";
import { FeaturesSection } from "@/components/FeaturesSection";
import { Footer } from "@/components/Footer";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();
  return (
    <main className="min-h-screen bg-iron-dark flex flex-col">
      <NavBar user={session?.user ?? null} />
      <HeroSection />
      <WeaponGrid />
      <FeaturesSection />
      <Footer />
    </main>
  );
}
