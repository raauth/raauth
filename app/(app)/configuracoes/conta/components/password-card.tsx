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
import { getErrorMessage } from "@/lib/errors";
import {
  changePasswordAction,
  setPasswordAction,
} from "@/server/actions/account";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "A senha atual é obrigatória"),
  newPassword: z
    .string()
    .min(10, "A nova senha deve ter no mínimo 10 caracteres"),
});

const setPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(10, "A senha deve ter no mínimo 10 caracteres"),
    confirmPassword: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não conferem",
  });

type PasswordCardProps = {
  hasPassword: boolean;
  createdWithSocialLogin: boolean;
};

export function PasswordCard({
  hasPassword,
  createdWithSocialLogin,
}: PasswordCardProps) {
  const [isPending, setIsPending] = useState(false);

  const changePasswordForm = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const setPasswordForm = useForm<z.infer<typeof setPasswordSchema>>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function handleChangePassword(
    values: z.infer<typeof changePasswordSchema>,
  ) {
    setIsPending(true);
    const { error } = await changePasswordAction(values);
    setIsPending(false);

    if (error) {
      toast.error(getErrorMessage(error.code));
      return;
    }

    toast.success("Senha alterada com sucesso!");
    changePasswordForm.reset();
  }

  async function handleSetPassword(values: z.infer<typeof setPasswordSchema>) {
    setIsPending(true);
    const { error } = await setPasswordAction({
      newPassword: values.newPassword,
    });
    setIsPending(false);

    if (error) {
      toast.error(getErrorMessage(error.code));
      return;
    }

    toast.success("Senha definida com sucesso!");
    setPasswordForm.reset();
  }

  return (
    <Card id="password-card">
      <CardHeader>
        <CardTitle>{hasPassword ? "Senha" : "Definir Senha"}</CardTitle>
        <CardDescription>
          {hasPassword
            ? "Altere sua senha atual."
            : createdWithSocialLogin
              ? "Sua conta foi criada com login social. Defina uma senha para habilitar login por e-mail/senha e gerenciar recursos que exigem credencial."
              : "Defina uma senha para sua conta."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasPassword ? (
          <Form {...changePasswordForm}>
            <form
              onSubmit={changePasswordForm.handleSubmit(handleChangePassword)}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={changePasswordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha Atual</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="current-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={changePasswordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova Senha</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-1">
                <Button type="submit" disabled={isPending}>
                  {isPending ? <Spinner /> : "Atualizar senha"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...setPasswordForm}>
            <form
              onSubmit={setPasswordForm.handleSubmit(handleSetPassword)}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={setPasswordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova Senha</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={setPasswordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-1">
                <Button type="submit" disabled={isPending}>
                  {isPending ? <Spinner /> : "Definir senha"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
