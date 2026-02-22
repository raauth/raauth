"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { getErrorMessage } from "@/lib/errors";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "A senha atual é obrigatória"),
  newPassword: z
    .string()
    .min(10, "A nova senha deve ter no mínimo 10 caracteres"),
});

export function PasswordCard() {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof passwordSchema>) {
    setIsPending(true);

    const { error } = await authClient.changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      revokeOtherSessions: true,
    });

    setIsPending(false);

    if (error) {
      toast.error(getErrorMessage(error.code || "UNKNOWN_ERROR"));
    } else {
      toast.success("Senha alterada com sucesso!");
      form.reset();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Senha</CardTitle>
        <CardDescription>
          Altere a senha utilizada para acessar a sua conta com segurança. Todas
          as outras sessões ativas serão desconectadas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 max-w-md"
          >
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha Atual</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova Senha</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? <Spinner /> : "Atualizar senha"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
