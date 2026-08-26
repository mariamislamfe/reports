import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-md">
      <Skeleton className="mb-4 h-4 w-24" />
      <Skeleton className="mb-2 h-6 w-40" />
      <Skeleton className="mb-6 h-4 w-64" />
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  );
}
