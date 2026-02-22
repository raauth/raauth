import { getCurrentUser } from "@/server/actions/session";
import { ProfileCard } from "./components/profile-card";
import { PasswordCard } from "./components/password-card";
import { PasskeysCard } from "./components/passkeys-card";
import { MfaCard } from "./components/mfa-card";
import { DangerZoneCard } from "./components/danger-zone-card";
import { AccountOverviewCard } from "./components/account-overview-card";
import { EmailCard } from "./components/email-card";

export default async function AccountSettingsPage() {
  const { currentUser } = await getCurrentUser();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Configurações da Conta
        </h1>
        <p className="text-muted-foreground">
          Gerencie seus dados e a segurança da sua conta.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <section className="space-y-6 lg:col-span-5">
          <ProfileCard user={currentUser} />
          <EmailCard user={currentUser} />
          <AccountOverviewCard user={currentUser} />
        </section>

        <section className="space-y-6 lg:col-span-7">
          <PasswordCard />
          <PasskeysCard />
          <MfaCard user={currentUser} />
          <DangerZoneCard />
        </section>
      </div>
    </div>
  );
}
