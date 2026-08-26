import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.DEEPL_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "Translation is not configured." }, { status: 501 });
  }

  let text: unknown;
  try {
    ({ text } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!text || typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "No text provided." }, { status: 400 });
  }

  try {
    // DeepL free-tier keys always end in ":fx" and use a different host than paid keys.
    const host = apiKey.endsWith(":fx") ? "api-free.deepl.com" : "api.deepl.com";

    const deeplRes = await fetch(`https://${host}/v2/translate`, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: [text],
        target_lang: "EN-US",
      }),
    });

    if (!deeplRes.ok) {
      const body = await deeplRes.text();
      console.error("DeepL translation failed:", deeplRes.status, body);
      return NextResponse.json({ error: "Translation service failed." }, { status: 502 });
    }

    const data = await deeplRes.json();
    const translation = data?.translations?.[0]?.text as string | undefined;
    if (!translation) {
      return NextResponse.json({ error: "Translation service returned no result." }, { status: 502 });
    }

    return NextResponse.json({ translation });
  } catch (err) {
    console.error("Translation request failed:", err);
    return NextResponse.json({ error: "Translation service failed." }, { status: 502 });
  }
}
