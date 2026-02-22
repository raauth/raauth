import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, CircleDashed, Link2 } from "lucide-react";
import { getProviderLabel } from "@/lib/account-security";

type SocialLoginsCardProps = {
  socialProviders: string[];
  primaryProvider: string | null;
  createdWithSocialLogin: boolean;
  hasPassword: boolean;
};

const supportedProviders = ["google", "github", "microsoft"];

export function SocialLoginsCard({
  socialProviders,
  primaryProvider,
  createdWithSocialLogin,
  hasPassword,
}: SocialLoginsCardProps) {
  const normalizedConnectedProviders = new Set(
    socialProviders.map((provider) => provider.trim().toLowerCase()),
  );

  const providersToDisplay = Array.from(
    new Set([...supportedProviders, ...socialProviders]),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="size-4" />
          Logins Sociais
        </CardTitle>
        <CardDescription>
          Visualize quais provedores estão vinculados à sua conta.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant={createdWithSocialLogin ? "secondary" : "outline"}>
            {createdWithSocialLogin
              ? `Conta criada com ${getProviderLabel(primaryProvider ?? "")}`
              : "Conta criada com e-mail e senha"}
          </Badge>
          <Badge variant={hasPassword ? "secondary" : "outline"}>
            {hasPassword ? "Senha local definida" : "Sem senha local"}
          </Badge>
        </div>

        <div className="space-y-2">
          {providersToDisplay.map((providerId) => {
            const normalizedProviderId = providerId.trim().toLowerCase();
            const isConnected = normalizedConnectedProviders.has(normalizedProviderId);

            return (
              <div
                key={normalizedProviderId}
                className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-2"
              >
                <p className="text-sm font-medium">
                  {getProviderLabel(normalizedProviderId)}
                </p>
                {isConnected ? (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="size-3.5" />
                    Conectado
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <CircleDashed className="size-3.5" />
                    Não conectado
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
