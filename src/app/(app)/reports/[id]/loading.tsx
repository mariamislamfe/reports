import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-lg">
      <Skeleton className="mb-4 h-4 w-32" />
      <div className="card mb-4">
        <Skeleton className="mb-2 h-3 w-24" />
        <Skeleton className="mb-3 h-5 w-48" />
        <Skeleton className="mb-1.5 h-3 w-full" />
        <Skeleton className="mb-1.5 h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}
