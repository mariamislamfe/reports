import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Resolves NEXT_PUBLIC_COMPANY_LOGO_URL into something @react-pdf/renderer's
 * <Image> can actually use server-side: full http(s) URLs are passed through
 * (react-pdf fetches them), anything else is treated as a path under
 * `public/` and inlined as a base64 data URI (a bare "/logo.png" is not a
 * resolvable filesystem path on its own once we're inside a request handler).
 */
export async function resolveLogoDataUri(): Promise<string | null> {
  const configured = process.env.NEXT_PUBLIC_COMPANY_LOGO_URL;
  if (!configured) return null;

  if (/^https?:\/\//i.test(configured)) return configured;

  try {
    const filePath = path.join(process.cwd(), "public", configured.replace(/^\//, ""));
    const buffer = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mime = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}
