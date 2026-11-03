import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { NavBar } from "@/components/NavBar";
import { backendJson } from "@/lib/backend";
import { BarChart3, Dumbbell, TrendingUp, Users } from "lucide-react";

export const metadata = { title: "Admin - IRON.FIT" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

function AdminStat({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="iron-card p-6">
      <div className="font-display text-2xs tracking-widest uppercase text-iron-gray mb-3">{label}</div>
      <div className="font-display font-black text-4xl tracking-tight text-iron-red leading-none">{value}</div>
      <div className="font-body text-iron-gray text-xs mt-3">{sub}</div>
    </div>
  );
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const { stats, recentUsers, recentPlans } = await backendJson<{
    stats: { totalUsers: number; totalWorkoutPlans: number; totalProgressRecords: number; averagePlansPerUser: number };
    recentUsers: Array<{ id: string; name: string; email: string; role: string }>;
    recentPlans: Array<{ id: string; name: string; goal: string; level: string }>;
  }>("/api/admin/stats", session.user);

  return (
    <main className="min-h-screen bg-iron-dark">
      <NavBar user={session.user} />
      <div className="max-w-[1000px] mx-auto px-4 py-10">
        <div className="mb-10">
          <div className="section-tag">Admin Panel</div>
          <h1 className="hero-title text-[clamp(2rem,5vw,3rem)]">APP USAGE</h1>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px mb-10" style={{ background: "var(--iron-border)" }}>
          <AdminStat label="Users" value={stats.totalUsers} sub="registered accounts" />
          <AdminStat label="Plans" value={stats.totalWorkoutPlans} sub="saved workout plans" />
          <AdminStat label="Progress" value={stats.totalProgressRecords} sub="tracking records" />
          <AdminStat label="Avg Plans/User" value={stats.averagePlansPerUser.toFixed(1)} sub="usage ratio" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px" style={{ background: "var(--iron-border)" }}>
          <section className="iron-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Users size={15} className="text-iron-red" />
              <h2 className="font-display font-black text-lg uppercase tracking-wide">Recent Users</h2>
            </div>
            <div className="space-y-2">
              {recentUsers.map((user) => (
                <div key={user.id} className="border border-iron p-4">
                  <div className="font-display font-black uppercase tracking-wide">{user.name || "Unnamed"}</div>
                  <div className="font-body text-iron-gray text-xs">{user.email}</div>
                  <span className="badge mt-2">{user.role ?? "user"}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="iron-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Dumbbell size={15} className="text-iron-red" />
              <h2 className="font-display font-black text-lg uppercase tracking-wide">Recent Plans</h2>
            </div>
            <div className="space-y-2">
              {recentPlans.map((plan) => (
                <div key={plan.id} className="border border-iron p-4">
                  <div className="font-display font-black uppercase tracking-wide">{plan.name}</div>
                  <div className="font-body text-iron-gray text-xs">{plan.goal} · {plan.level}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="iron-card p-6 mt-10 flex items-start gap-4">
          <div className="w-9 h-9 flex items-center justify-center border border-iron-border2 shrink-0" style={{ background: "var(--iron-red-glow2)" }}>
            <BarChart3 size={17} className="text-iron-red" />
          </div>
          <div>
            <div className="font-display font-black text-base uppercase tracking-wide mb-1">Usage Stats</div>
            <p className="font-body text-iron-gray text-sm leading-relaxed">
              Admin access is role-protected. This panel shows aggregate app usage and recent records without exposing API keys or provider details.
            </p>
          </div>
          <TrendingUp size={16} className="text-iron-red ml-auto hidden sm:block" />
        </div>
      </div>
    </main>
  );
}
