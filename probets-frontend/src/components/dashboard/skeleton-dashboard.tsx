export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 rounded-2xl bg-zinc-800/70" />)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="h-80 rounded-2xl bg-zinc-800/60" />
        <div className="h-80 rounded-2xl bg-zinc-800/60" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="h-96 rounded-2xl bg-zinc-800/60" />
        <div className="h-96 rounded-2xl bg-zinc-800/60" />
      </div>
    </div>
  );
}
