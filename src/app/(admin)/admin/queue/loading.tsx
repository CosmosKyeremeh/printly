export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-1 py-2">
      {/* Header Skeleton Module */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800/60 animate-pulse" />
        <div className="space-y-2">
          <div className="h-5 w-48 rounded-lg bg-zinc-900 animate-pulse" />
          <div className="h-3 w-32 rounded-md bg-zinc-900/40 animate-pulse" />
        </div>
      </div>

      {/* Metrics / Cards Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            className="rounded-2xl p-5 border border-zinc-900 bg-zinc-950/20 animate-pulse"
          >
            <div className="w-9 h-9 rounded-xl mb-4 bg-zinc-900 border border-zinc-800/40" />
            <div className="h-6 w-12 rounded-md mb-2 bg-zinc-900" />
            <div className="h-3 w-20 rounded-md bg-zinc-900/40" />
          </div>
        ))}
      </div>

      {/* Queue / Records Stream List Skeleton */}
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            className="rounded-xl p-4 border border-zinc-900 bg-zinc-950/20 animate-pulse"
          >
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg shrink-0 bg-zinc-900 border border-zinc-800/40" />
              <div className="flex-1 space-y-2.5">
                <div className="h-4 w-2/3 rounded-md bg-zinc-900" />
                <div className="h-3 w-1/3 rounded-md bg-zinc-900/40" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}