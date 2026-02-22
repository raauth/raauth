import { getCurrentUser } from "@/server/actions/session";
import { db } from "@/lib/db";
import {
  calculateAccountSecurityState,
  extractAccountAuthInsights,
} from "@/lib/account-security";
import { ProfileCard } from "./components/profile-card";
import { PasswordCard } from "./components/password-card";
import { PasskeysCard } from "./components/passkeys-card";
import { MfaCard } from "./components/mfa-card";
import { DangerZoneCard } from "./components/danger-zone-card";
import { AccountOverviewCard } from "./components/account-overview-card";
import { EmailCard } from "./components/email-card";
import { SocialLoginsCard } from "./components/social-logins-card";

export default async function AccountSettingsPage() {
  const { currentUser } = await getCurrentUser();
  const [accounts, passkeysCount] = await Promise.all([
    db.account.findMany({
      where: { userId: currentUser.id },
      select: {
        providerId: true,
        createdAt: true,
        password: true,
      },
    }),
    db.passkey.count({
      where: { userId: currentUser.id },
    }),
  ]);

  const authInsights = extractAccountAuthInsights(accounts, passkeysCount);
  const accountSecurity = calculateAccountSecurityState({
    emailVerified: Boolean(currentUser.emailVerified),
    twoFactorEnabled: Boolean(currentUser.twoFactorEnabled),
    hasPassword: authInsights.hasPassword,
    hasPasskeys: authInsights.passkeysCount > 0,
    hasSocialLogin: authInsights.hasSocialLogin,
  });

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
          <SocialLoginsCard
            socialProviders={authInsights.socialProviders}
            primaryProvider={authInsights.primaryProvider}
            createdWithSocialLogin={authInsights.createdWithSocialLogin}
            hasPassword={authInsights.hasPassword}
          />
          <AccountOverviewCard
            user={currentUser}
            security={accountSecurity}
            authInsights={authInsights}
          />
        </section>

        <section className="space-y-6 lg:col-span-7">
          <PasswordCard
            hasPassword={authInsights.hasPassword}
            createdWithSocialLogin={authInsights.createdWithSocialLogin}
          />
          <PasskeysCard />
          <MfaCard
            user={currentUser}
            hasPassword={authInsights.hasPassword}
            socialProviders={authInsights.socialProviders}
            hasPasskeys={authInsights.passkeysCount > 0}
          />
          <DangerZoneCard />
        </section>
      </div>
    </div>
  );
}
