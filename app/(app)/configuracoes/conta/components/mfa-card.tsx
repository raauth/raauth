"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  Check,
  Copy,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { getErrorMessage } from "@/lib/errors";
import { QRCodeSVG } from "qrcode.react";
import {
  disableTwoFactorAction,
  enableTwoFactorAction,
} from "@/server/actions/account";

type MfaUser = {
  twoFactorEnabled?: boolean | null;
};

type MfaCardProps = {
  user: MfaUser;
  hasPassword: boolean;
  socialProviders: string[];
  hasPasskeys: boolean;
};

function formatSocialProviders(providers: string[]) {
  if (providers.length === 0) {
    return "provedor social";
  }

  const labels = providers.map((provider) => {
    const normalized = provider.trim().toLowerCase();

    if (normalized === "google") {
      return "Google";
    }

    if (normalized === "github") {
      return "GitHub";
    }

    if (normalized === "microsoft") {
      return "Microsoft";
    }

    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  });

  if (labels.length === 1) {
    return labels[0];
  }

  if (labels.length === 2) {
    return `${labels[0]} e ${labels[1]}`;
  }

  return `${labels.slice(0, -1).join(", ")} e ${labels.at(-1)}`;
}

export function MfaCard({
  user,
  hasPassword,
  socialProviders,
  hasPasskeys,
}: MfaCardProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [totpURI, setTotpURI] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const isEnabled = user?.twoFactorEnabled;
  const socialProvidersLabel = formatSocialProviders(socialProviders);
  const requiresCredential = !hasPassword;

  async function handleEnableMfa() {
    if (!password) {
      toast.error("Você precisa digitar sua senha para ativar o MFA.");
      return;
    }

    setIsPending(true);
    const { data, error } = await enableTwoFactorAction({ password });
    setIsPending(false);

    if (error) {
      toast.error(getErrorMessage(error.code));
    } else if (data) {
      setTotpURI(data.totpURI);
      setBackupCodes(data.backupCodes);
      toast.success("Autenticação em duas etapas gerada. Escaneie o QR Code!");
    }
  }

  async function handleDisableMfa() {
    if (!password) {
      toast.error("Você precisa digitar sua senha para desativar o MFA.");
      return;
    }

    setIsPending(true);
    const { error } = await disableTwoFactorAction({ password });
    setIsPending(false);

    if (error) {
      toast.error(getErrorMessage(error.code));
    } else {
      toast.success("MFA desativado com sucesso.");
      setPassword("");
      router.refresh();
    }
  }

  const copyCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEnabled ? (
            <ShieldCheck className="h-5 w-5 text-green-500" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-amber-500" />
          )}
          Autenticação de Duas Etapas (2FA)
        </CardTitle>
        <CardDescription>
          Configure o autenticador para exigir código TOTP no login por senha.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isEnabled && !requiresCredential ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-md border border-green-200 dark:border-green-900">
              <p className="font-medium">O MFA está ativo na sua conta.</p>
              <p className="text-sm mt-1">
                Sua conta está mais segura. Para desativar, digite sua senha
                abaixo.
              </p>
            </div>

            <div className="space-y-2 max-w-sm">
              <Label>Senha atual para confirmar a desativação</Label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                />
                <Button
                  variant="destructive"
                  onClick={handleDisableMfa}
                  disabled={isPending || !password}
                >
                  {isPending ? <Spinner /> : "Desativar MFA"}
                </Button>
              </div>
            </div>
          </div>
        ) : requiresCredential ? (
          <div className="space-y-4">
            <div className="rounded-md border border-amber-300/60 bg-amber-50/80 p-4 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200">
              <p className="flex items-center gap-2 font-medium">
                <TriangleAlert className="size-4" />
                2FA do Better Auth exige senha local
              </p>
              <p className="mt-2 text-sm">
                Contas somente sociais ainda não ativam o TOTP nativo sem
                credencial. Para segurança sem senha, mantenha 2FA ativo no{" "}
                {socialProvidersLabel}.
              </p>
            </div>

            <div className="rounded-md border bg-muted/30 p-4 text-sm space-y-2">
              <p>
                {hasPasskeys
                  ? "Você já possui passkeys cadastrados. Isso ajuda a proteger o acesso sem senha."
                  : "Você pode reforçar a proteção sem senha cadastrando passkeys."}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <a href="#password-card">Definir senha para ativar TOTP</a>
                </Button>
                {!hasPasskeys && <span className="text-muted-foreground">ou use Passkeys</span>}
              </div>
            </div>
          </div>
        ) : isEnabled ? (
          <div className="rounded-md border border-amber-300/60 bg-amber-50/80 p-4 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200">
            <p className="font-medium">2FA ativo sem senha local detectado.</p>
            <p className="mt-2 text-sm">
              Defina uma senha para gerenciar desativação ou regeneração de
              códigos com segurança.
            </p>
          </div>
        ) : totpURI ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4 p-6 border rounded-md bg-muted/30">
              <p className="font-medium">
                1. Escaneie este QR Code no seu aplicativo autenticador
              </p>
              <div className="p-4 bg-white rounded-xl shadow-sm">
                <QRCodeSVG value={totpURI} size={200} />
              </div>
            </div>

            <div className="space-y-4">
              <p className="font-medium">
                2. Salve seus códigos de recuperação (Backup Codes)
              </p>
              <p className="text-sm text-muted-foreground">
                Estes códigos são a única forma de acessar sua conta caso você
                perca seu dispositivo autenticador. Salve-os em um local seguro.
              </p>

              <div className="relative p-4 bg-muted rounded-md border font-mono text-sm grid grid-cols-2 gap-2">
                {backupCodes.map((code, idx) => (
                  <div key={idx} className="tracking-widest">
                    {code}
                  </div>
                ))}

                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2 h-8"
                  onClick={copyCodes}
                >
                  {copied ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copied ? "Copiado" : "Copiar"}
                </Button>
              </div>

              <Button
                onClick={() => router.refresh()}
                className="w-full mt-4"
              >
                Já salvei os códigos e escaneei o QR Code
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-sm">
            <div className="space-y-2">
              <Label>Para ativar o MFA, digite sua senha atual</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
              />
            </div>
            <Button onClick={handleEnableMfa} disabled={isPending || !password}>
              {isPending ? <Spinner /> : "Configurar autenticador"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
