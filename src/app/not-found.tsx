import Link from "next/link";
import { getServerDictionary } from "@/lib/i18n/server";
import { Icon } from "@/components/ui/icon";

export default async function NotFound() {
  const { dict } = await getServerDictionary();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <Icon name="warning" className="h-7 w-7" />
      </div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{dict.notFound.title}</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {dict.notFound.description}
      </p>
      <Link href="/dashboard" className="btn-primary mt-6">
        {dict.notFound.backHome}
      </Link>
    </div>
  );
}
