import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-0.5 flex-1" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-0.5 flex-1" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-0.5 flex-1" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="mb-3 h-5 w-40" />
      <div className="space-y-2">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
      </div>
    </div>
  );
}
