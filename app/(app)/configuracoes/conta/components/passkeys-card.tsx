"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Fingerprint, Trash2, Plus } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";

export function PasskeysCard() {
  const [passkeys, setPasskeys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  async function loadPasskeys() {
    setIsLoading(true);
    const { data, error } = await authClient.passkey.listUserPasskeys();

    if (error) {
      toast.error(
        "Erro ao carregar passkeys: " +
          getErrorMessage((error as any).code || ""),
      );
      // The original code did not return here, so setIsLoading(false) was always called.
      // Keeping the original flow where setIsLoading(false) is always called.
    } else if (data) {
      setPasskeys(data);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    loadPasskeys();
  }, []);

  async function handleAddPasskey() {
    setIsAdding(true);
    const { error } = await authClient.passkey.addPasskey();
    setIsAdding(false);

    if (error) {
      toast.error(getErrorMessage((error as any).code || ""));
    } else {
      toast.success("Passkey adicionado com sucesso!");
      loadPasskeys();
    }
  }

  async function handleDeletePasskey(id: string) {
    const { error } = await authClient.passkey.deletePasskey({ id });
    if (error) {
      toast.error(getErrorMessage((error as any).code || ""));
    } else {
      toast.success("Passkey removido.");
      loadPasskeys();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5" />
          Passkeys
        </CardTitle>
        <CardDescription>
          Gerencie suas chaves de segurança biométricas ou dispositivos para
          login sem senha.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Spinner />
          </div>
        ) : passkeys.length === 0 ? (
          <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-md border text-center">
            Nenhum passkey cadastrado.
          </div>
        ) : (
          <div className="space-y-4">
            {passkeys.map((pk) => (
              <div
                key={pk.id}
                className="flex justify-between items-center p-3 border rounded-md"
              >
                <div>
                  <p className="font-medium text-sm">
                    {pk.name || "Dispositivo sem nome"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Adicionado em {new Date(pk.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  onClick={() => handleDeletePasskey(pk.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleAddPasskey}
          disabled={isAdding || isLoading}
          variant="outline"
        >
          {isAdding ? (
            <Spinner className="mr-2" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Adicionar Passkey
        </Button>
      </CardFooter>
    </Card>
  );
}
