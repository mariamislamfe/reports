import { Skeleton, CardListSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="mb-2 h-6 w-24" />
      <Skeleton className="mb-6 h-4 w-64" />
      <CardListSkeleton rows={4} />
    </div>
  );
}
