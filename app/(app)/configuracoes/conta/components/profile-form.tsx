"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
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

const profileSchema = z.object({
  name: z.string().min(1, "O nome não pode ser vazio"),
  username: z.string().optional(),
});

export function ProfileForm({ user }: { user: any }) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      username: user?.username || "",
    },
  });

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    setIsPending(true);

    const { error } = await authClient.updateUser({
      name: values.name,
      username: values.username || undefined,
    });

    setIsPending(false);

    if (error) {
      toast.error(getErrorMessage(error.code || "UNKNOWN_ERROR"));
    } else {
      toast.success("Perfil atualizado com sucesso!");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome de Usuário</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? <Spinner /> : "Salvar alterações"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
