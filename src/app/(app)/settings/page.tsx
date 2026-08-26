import { redirect } from "next/navigation";
import { getCurrentProfile, getSignedSignatureUrl } from "@/lib/data";
import { getServerDictionary } from "@/lib/i18n/server";
import { PageHeader } from "@/components/ui/page-header";
import { ProfileForm } from "./profile-form";
import { SignatureForm } from "./signature-form";
import { signOut } from "@/app/login/actions";
import { Icon } from "@/components/ui/icon";

export default async function SettingsPage() {
  const [profile, { dict }] = await Promise.all([getCurrentProfile(), getServerDictionary()]);
  if (!profile) redirect("/login");

  const signatureUrl = await getSignedSignatureUrl(profile.signature_path);

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title={dict.settings.title} description={dict.settings.description} />

      <div className="card mb-4">
        <ProfileForm profile={profile} dict={dict} />
      </div>

      <div className="card mb-4">
        <SignatureForm
          userId={profile.id}
          initialSignatureUrl={signatureUrl}
          initialConsent={profile.signature_consent}
          dict={dict}
        />
      </div>

      <form action={signOut}>
        <button type="submit" className="btn-secondary w-full">
          <Icon name="logout" className="h-4 w-4" />
          {dict.common.signOut}
        </button>
      </form>
    </div>
  );
}
