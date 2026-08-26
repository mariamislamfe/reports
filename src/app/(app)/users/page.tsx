import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data";
import { getServerDictionary } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { UserList } from "./user-list";
import type { Profile } from "@/lib/types";

export default async function UsersPage() {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") redirect("/dashboard");

  const { dict } = await getServerDictionary();
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").order("full_name");

  const users = (data ?? []) as Profile[];

  return (
    <div>
      <PageHeader title={dict.users.title} description={dict.users.description} />

      {users.length === 0 ? (
        <EmptyState icon="doc" title={dict.users.title} />
      ) : (
        <UserList users={users} dict={dict} />
      )}
    </div>
  );
}
