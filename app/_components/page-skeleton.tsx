interface PageSkeletonProps {
  bannerHeight?: string
  cards?: number
  cardHeight?: string
}

export function PageSkeleton({ 
  bannerHeight = "h-[280px]", 
  cards = 4,
  cardHeight = "h-24"
}: PageSkeletonProps) {
  return (
    <div className="flex min-h-svh flex-col bg-background pb-24 animate-pulse">
      <div className={`${bannerHeight} bg-muted rounded-b-[20px]`} />
      <div className="flex flex-col gap-3 p-5">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className={`${cardHeight} bg-muted rounded-xl`} />
        ))}
      </div>
    </div>
  )
}