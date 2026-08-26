import { Skeleton, CardListSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="mb-2 h-4 w-24" />
      <Skeleton className="mb-6 h-7 w-40" />
      <Skeleton className="mb-6 h-20 w-full rounded-2xl" />
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
      </div>
      <Skeleton className="mb-3 h-5 w-32" />
      <CardListSkeleton rows={3} />
    </div>
  );
}
