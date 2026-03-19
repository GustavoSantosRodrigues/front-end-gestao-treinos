import { PageSkeleton } from "../_components/page-skeleton"

export default function Loading() {
  return <PageSkeleton bannerHeight="h-32" cards={3} cardHeight="h-16" />
}