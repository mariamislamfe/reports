import Link from "next/link";
import { LoginForm } from "./login-form";
import { getServerDictionary } from "@/lib/i18n/server";
import { CompanyMark } from "@/components/ui/company-mark";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;
  const { dict } = await getServerDictionary();

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <CompanyMark size={56} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {process.env.NEXT_PUBLIC_COMPANY_NAME || "Violation Reports"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{dict.auth.signInTitle}</p>
        </div>

        <div className="card">
          <LoginForm redirectTo={redirectTo} dict={dict} />
        </div>

        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          {dict.auth.noAccount}{" "}
          <Link href="/signup" className="font-medium text-brand-600">
            {dict.auth.createOne}
          </Link>
        </p>

        <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-600">
          Made by Mariam Islam
        </p>
      </div>
    </div>
  );
}
