import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data";
import { getServerDictionary } from "@/lib/i18n/server";
import { Sidebar } from "@/components/nav/sidebar";
import { BottomNav } from "@/components/nav/bottom-nav";
import { MobileHeader } from "@/components/nav/mobile-header";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const { dict } = await getServerDictionary();

  return (
    <div className="ltr:md:pl-64 rtl:md:pr-64">
      <Sidebar profile={profile} dict={dict} />
      <MobileHeader profile={profile} dict={dict} />
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-4 md:px-8 md:py-8 md:pb-8">{children}</main>
      <BottomNav profile={profile} dict={dict} />
    </div>
  );
}
