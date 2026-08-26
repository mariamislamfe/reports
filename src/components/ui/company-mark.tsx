import Image from "next/image";

const LOGO_URL = process.env.NEXT_PUBLIC_COMPANY_LOGO_URL;
const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "Violation Reports";

/** Shows the real company logo when one is configured; falls back to a letter mark otherwise. */
export function CompanyMark({ size = 36 }: { size?: number }) {
  if (LOGO_URL) {
    return (
      <Image
        src={LOGO_URL}
        alt={COMPANY_NAME}
        width={size}
        height={size}
        className="shrink-0 rounded-lg object-contain"
        style={{ width: size, height: size }}
        priority
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-lg bg-brand-600 font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {COMPANY_NAME.charAt(0)}
    </div>
  );
}
