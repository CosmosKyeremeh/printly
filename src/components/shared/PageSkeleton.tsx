export function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="max-w-3xl mx-auto animate-pulse font-sans">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-lg bg-zinc-800/80 border border-zinc-700/30" />
        <div className="space-y-2">
          <div className="h-5 w-40 rounded-lg bg-zinc-800" />
          <div className="h-3 w-24 rounded-lg bg-zinc-900" />
        </div>
      </div>
      
      {/* Rows */}
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="rounded-xl p-4 border border-zinc-900/60 bg-zinc-900/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg shrink-0 bg-zinc-800/50" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-zinc-800" />
                <div className="h-3 w-1/2 rounded bg-zinc-900" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}