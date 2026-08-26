// react-pdf's line-wrapping engine treats a Lam ("ل") immediately followed by
// an Alef ("ا" / "أ" / "إ" / "آ") as two independent glyphs, and can split or
// drop them when that pair happens to land on a line-wrap boundary — Arabic
// requires these two letters to always render as a single fused ligature
// glyph. Pre-composing the pair into its single Unicode presentation-form
// codepoint (already present in the Cairo font we embed) makes the pair
// atomic before it ever reaches react-pdf's wrapper, so it can no longer be
// split, dropped, or reordered.
const ALEF_LIGATURES: Record<number, { isolated: number; final: number }> = {
  0x0627: { isolated: 0xfefb, final: 0xfefc }, // ا
  0x0622: { isolated: 0xfef5, final: 0xfef6 }, // آ
  0x0623: { isolated: 0xfef7, final: 0xfef8 }, // أ
  0x0625: { isolated: 0xfef9, final: 0xfefa }, // إ
};

// Arabic letters that never connect to the letter following them — when one
// of these precedes a Lam, the Lam+Alef pair starts a fresh visual cluster
// and must use the isolated ligature form rather than the final form.
const NON_JOINING_LEFT = new Set([
  0x0627, 0x0622, 0x0623, 0x0625, // alef forms
  0x062f, 0x0630, // dal, thal
  0x0631, 0x0632, // ra, zain
  0x0648, 0x0624, // waw, waw with hamza
  0x0629, // teh marbuta
  0x0649, // alef maksura
]);

const LAM = 0x0644;

function isArabicLetter(code: number): boolean {
  return code >= 0x0621 && code <= 0x064a;
}

export function reshapeArabicLigatures<T extends string | null | undefined>(input: T): T {
  if (!input) return input;
  const chars = Array.from(input);
  let out = "";
  for (let i = 0; i < chars.length; i++) {
    const code = chars[i].codePointAt(0)!;
    if (code === LAM && i + 1 < chars.length) {
      const nextCode = chars[i + 1].codePointAt(0)!;
      const ligature = ALEF_LIGATURES[nextCode];
      if (ligature) {
        const prevCode = i > 0 ? chars[i - 1].codePointAt(0) : undefined;
        const prevConnects = prevCode !== undefined && isArabicLetter(prevCode) && !NON_JOINING_LEFT.has(prevCode);
        out += String.fromCodePoint(prevConnects ? ligature.final : ligature.isolated);
        i++; // the Alef is consumed as part of the ligature
        continue;
      }
    }
    out += chars[i];
  }
  return out as T;
}
