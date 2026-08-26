import type { NextApiRequest, NextApiResponse } from "next";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { renderToBuffer } from "@react-pdf/renderer";
import { ViolationReportDocument } from "@/lib/pdf/violation-report-document";
import { resolveLogoDataUri } from "@/lib/pdf/logo";
import { effectivePhotoPaths } from "@/lib/utils";
import type { Report } from "@/lib/types";

// This lives under the Pages Router (not app/) deliberately: Next.js's App
// Router applies its React Server Components module resolution to every file
// under app/, including plain Route Handlers, which conflicts with
// @react-pdf/renderer's own bundled reconciler and throws a "not a valid
// React child" error no matter what the component tree looks like. Pages
// Router API routes are plain Node functions with no such aliasing, so PDF
// generation works there without issue.

async function downloadAsDataUri(
  supabase: SupabaseClient,
  bucket: string,
  path: string | null | undefined,
  fallbackMime: string
): Promise<string | null> {
  if (!path) return null;
  const { data: blob } = await supabase.storage.from(bucket).download(path);
  if (!blob) return null;
  const buffer = Buffer.from(await blob.arrayBuffer());
  const mime = blob.type || fallbackMime;
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

async function downloadManyAsDataUris(
  supabase: SupabaseClient,
  bucket: string,
  paths: string[],
  fallbackMime: string
): Promise<string[]> {
  const results = await Promise.all(
    paths.map((path) => downloadAsDataUri(supabase, bucket, path, fallbackMime))
  );
  return results.filter((r): r is string => Boolean(r));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return Object.entries(req.cookies).map(([name, value]) => ({
            name,
            value: value ?? "",
          }));
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          const existing = res.getHeader("Set-Cookie");
          const prior = Array.isArray(existing) ? existing : existing ? [String(existing)] : [];
          const next = cookiesToSet.map(
            ({ name, value, options }) =>
              `${name}=${value}; Path=${options.path ?? "/"}${
                options.maxAge ? `; Max-Age=${options.maxAge}` : ""
              }`
          );
          res.setHeader("Set-Cookie", [...prior, ...next]);
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  // RLS scopes this to the caller's own reports unless they are an admin.
  const { data: report, error } = await supabase.from("reports").select("*").eq("id", id).single();
  if (error || !report) return res.status(404).json({ error: "Report not found" });

  const typedReport = report as Report;

  try {
    const [
      logoDataUri,
      photoDataUris,
      signatureDataUri,
      contractorPhotoDataUris,
      contractorSignatureDataUri,
      closeoutSignatureDataUri,
    ] = await Promise.all([
      resolveLogoDataUri(),
      downloadManyAsDataUris(
        supabase,
        "violation-photos",
        effectivePhotoPaths(typedReport.photo_paths, typedReport.photo_path),
        "image/jpeg"
      ),
      downloadAsDataUri(
        supabase,
        "signatures",
        typedReport.employee_snapshot.signature_path,
        "image/png"
      ),
      downloadManyAsDataUris(
        supabase,
        "violation-photos",
        effectivePhotoPaths(typedReport.contractor_photo_paths, typedReport.contractor_photo_path),
        "image/jpeg"
      ),
      downloadAsDataUri(
        supabase,
        "signatures",
        typedReport.contractor_snapshot?.signature_path,
        "image/png"
      ),
      downloadAsDataUri(
        supabase,
        "signatures",
        typedReport.closeout_snapshot?.signature_path,
        "image/png"
      ),
    ]);

    const pdfBuffer = await renderToBuffer(
      ViolationReportDocument({
        report: typedReport,
        photoDataUris,
        logoDataUri,
        signatureDataUri,
        contractorPhotoDataUris,
        contractorSignatureDataUri,
        closeoutSignatureDataUri,
      })
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${typedReport.report_number}.pdf"`);
    res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error("PDF generation failed:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
}
