export function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="max-w-3xl mx-auto animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-lg" style={{ background: '#64000030' }} />
        <div className="space-y-2">
          <div className="h-6 w-40 rounded-lg" style={{ background: '#64000030' }} />
          <div className="h-3 w-24 rounded-lg" style={{ background: '#42000150' }} />
        </div>
      </div>
      {/* Rows */}
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="rounded-xl p-4 border" style={{ background: '#420001', borderColor: '#64000040' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg shrink-0" style={{ background: '#64000030' }} />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded" style={{ background: '#64000030' }} />
                <div className="h-3 w-1/2 rounded" style={{ background: '#42000150' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}