import Link from "next/link";
import { SignUpForm } from "./signup-form";
import { getServerDictionary } from "@/lib/i18n/server";
import { CompanyMark } from "@/components/ui/company-mark";

export default async function SignUpPage() {
  const { dict } = await getServerDictionary();

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <CompanyMark size={56} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {dict.auth.createAccountTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {process.env.NEXT_PUBLIC_COMPANY_NAME || "Violation Reports"}
          </p>
        </div>

        <div className="card">
          <SignUpForm dict={dict} />
        </div>

        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          {dict.auth.alreadyHaveAccount}{" "}
          <Link href="/login" className="font-medium text-brand-600">
            {dict.auth.signInLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
