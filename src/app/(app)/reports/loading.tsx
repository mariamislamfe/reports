import { Skeleton, CardListSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Skeleton className="mb-2 h-6 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-20 rounded-xl" />
      </div>
      <Skeleton className="mb-4 h-11 w-full rounded-xl" />
      <CardListSkeleton rows={5} />
    </div>
  );
}
