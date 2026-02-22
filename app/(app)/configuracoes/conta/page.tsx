import { redirect } from "next/navigation";
import { getServerSession } from "@/server/actions/session";
import { ProfileCard } from "./components/profile-card";
import { PasswordCard } from "./components/password-card";
import { PasskeysCard } from "./components/passkeys-card";
import { MfaCard } from "./components/mfa-card";
import { DangerZoneCard } from "./components/danger-zone-card";

export default async function AccountSettingsPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/entrar");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Configurações da Conta
        </h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais, métodos de login e segurança
          avançada.
        </p>
      </div>

      <ProfileCard user={session.user} />
      <PasswordCard />
      <PasskeysCard />
      <MfaCard user={session.user} />
      <DangerZoneCard />
    </div>
  );
}
