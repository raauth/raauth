"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { ShieldAlert, ShieldCheck, Copy, Check } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";
import { QRCodeSVG } from "qrcode.react";

export function MfaCard({ user }: { user: any }) {
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [totpURI, setTotpURI] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const isEnabled = user?.twoFactorEnabled;

  async function handleEnableMfa() {
    if (!password) {
      toast.error("Você precisa digitar sua senha para ativar o MFA.");
      return;
    }

    setIsPending(true);
    const { data, error } = await authClient.twoFactor.enable({ password });
    setIsPending(false);

    if (error) {
      toast.error(getErrorMessage((error as any).code || ""));
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
    const { error } = await authClient.twoFactor.disable({ password });
    setIsPending(false);

    if (error) {
      toast.error(getErrorMessage((error as any).code || ""));
    } else {
      toast.success("MFA desativado com sucesso.");
      window.location.reload(); // Quick refresh to update user state
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
          Adicione uma camada extra de segurança à sua conta exigindo um código
          gerado pelo seu aplicativo autenticador.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isEnabled ? (
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
                onClick={() => window.location.reload()}
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
