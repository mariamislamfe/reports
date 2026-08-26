/** True once a deadline is within 2 days away or already past. */
export function isDeadlineUrgent(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const deadline = new Date(dateStr);
  if (Number.isNaN(deadline.getTime())) return false;
  const twoDaysFromNow = new Date();
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
  return deadline <= twoDaysFromNow;
}

/** Prefers the new multi-photo array; falls back to the legacy single path for older reports. */
export function effectivePhotoPaths(paths: string[] | null | undefined, legacy: string | null): string[] {
  if (paths && paths.length > 0) return paths;
  return legacy ? [legacy] : [];
}

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
