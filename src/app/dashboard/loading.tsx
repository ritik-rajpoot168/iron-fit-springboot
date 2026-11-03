// src/app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="max-w-[900px] mx-auto px-4 py-10">
      {/* Header skeleton */}
      <div className="flex justify-between mb-10">
        <div>
          <div className="skeleton h-3 w-24 mb-3 rounded" />
          <div className="skeleton h-10 w-64 rounded" />
        </div>
        <div className="skeleton h-10 w-28 rounded" />
      </div>
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px mb-10" style={{ background: "var(--iron-border)" }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="iron-card p-6">
            <div className="skeleton h-3 w-20 mb-4 rounded" />
            <div className="skeleton h-10 w-16 rounded" />
          </div>
        ))}
      </div>
      {/* Cards skeleton */}
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="iron-card p-5">
            <div className="skeleton h-5 w-48 mb-2 rounded" />
            <div className="skeleton h-3 w-72 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
