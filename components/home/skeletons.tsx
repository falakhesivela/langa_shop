function SectionHeaderSkeleton() {
  return (
    <div>
      <div className="h-4 w-24 animate-pulse rounded-sm bg-muted" />
      <div className="mt-4 h-10 w-64 animate-pulse rounded-sm bg-muted" />
    </div>
  )
}

export function ProductRailSkeleton({ rows = 1 }: { rows?: number }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <SectionHeaderSkeleton />
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
        {Array.from({ length: rows * 4 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-3/4 animate-pulse rounded-sm bg-muted" />
            <div className="mt-4 h-4 w-3/4 animate-pulse rounded-sm bg-muted" />
            <div className="mt-2 h-3 w-1/2 animate-pulse rounded-sm bg-muted" />
          </div>
        ))}
      </div>
    </section>
  )
}

export function CategoryGridSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
      <SectionHeaderSkeleton />
      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="animate-pulse rounded-sm bg-muted max-md:aspect-4/5 md:col-span-2 md:row-span-2" />
        <div className="hidden aspect-4/5 animate-pulse rounded-sm bg-muted md:block" />
        <div className="hidden aspect-4/5 animate-pulse rounded-sm bg-muted md:block" />
      </div>
    </section>
  )
}
