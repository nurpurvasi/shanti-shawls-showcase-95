export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-cream animate-pulse">
      <div className="h-16 border-b border-maroon/10 bg-cream/80" />
      <div className="px-6 md:px-10 py-20">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="h-3 w-32 rounded bg-maroon/10" />
          <div className="h-10 w-2/3 rounded bg-maroon/10" />
          <div className="h-4 w-1/2 rounded bg-maroon/5" />
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[4/5] rounded-2xl bg-maroon/5" />
                <div className="h-3 w-3/4 rounded bg-maroon/10" />
                <div className="h-3 w-1/2 rounded bg-maroon/5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
