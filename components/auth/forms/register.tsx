"use client";

import React, {
  useState
} from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

// componentes:
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

// ícones:
import {
  Check,
  EyeIcon,
  EyeClosedIcon,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

// esquema do zod:
const registerInfos = z.object({
  name: z.string().min(1, { message: "Como devemos te chamar?" }),
  lastname: z.string().min(1, { message: "Seu sobrenome é?" }),
  email: z
    .email({ message: "O e-mail digitado não é válido" })
    .min(5, { message: "Precisamos de um e-mail para entrar em contato" }),
  password: z
    .string()
    .min(1, { message: "Sua senha precisa ter ao menos 10 caracteres" }),
});

export function RegisterForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [showErrorFlash, setShowErrorFlash] = useState(false);

  // escolhe a classe de cor do botão
  const buttonColorClass = showCheck
    ? "bg-green-500"
    : showErrorFlash
    ? "bg-red-500 hover:bg-red-600"
    : null;

  const form = useForm<z.infer<typeof registerInfos>>({
    resolver: zodResolver(registerInfos),
    defaultValues: {
      name: "",
      lastname: "",
      email: "",
      password: "",
    },
  });

  const pass = useWatch({ control: form.control, name: "password" })
  const [ showPass, setShowPass ] = useState<boolean>(false);
  const disableShowPassButton = pass === "" || pass === undefined;

  async function onSubmit(values: z.infer<typeof registerInfos>) {
    setShowCheck(false);
    setShowErrorFlash(false);
    setIsPending(true);

    await authClient.signUp.email(
      {
        email: values.email,
        password: values.password,
        name: values.name + " " + values.lastname,
        callbackURL: "",
      },
      {
        onRequest: () => {
          setIsPending(true);
        },
        onSuccess: (ctx) => {
          setIsPending(false);
          setShowCheck(true);

          sessionStorage.setItem('registerSuccess', 'true');
          sessionStorage.setItem('registeredEmail', ctx.data.user.email);

          setTimeout(() => {
            router.push("/criar-conta/confirmar");
          }, 1000);
        },
        onError: (ctx) => {
          setIsPending(false);
          setShowErrorFlash(true);
          setTimeout(() => setShowErrorFlash(false), 2000);
          toast.error(getErrorMessage(ctx.error.code))
        },
      }
    );
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-x-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input autoComplete="given-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sobrenome</FormLabel>
                  <FormControl>
                    <Input autoComplete="family-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input
                    placeholder="você@alguma-coisa.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>

                <FormControl>
                  <div className="flex">
                    <Input
                      type={showPass ? "text" : "password"}
                      placeholder="**********"
                      autoComplete="new-password"
                      className="rounded-r-none"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-l-none border-l-0"
                      onClick={() => setShowPass((prev) => !prev)}
                      disabled={disableShowPassButton}
                    >
                      {showPass && !disableShowPassButton ? (
                        <EyeIcon className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <EyeClosedIcon className="h-4 w-4" aria-hidden="true" />
                      )}
                      <span className="sr-only">
                        {showPass ? "Esconder senha" : "Mostrar senha"}
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className={`${buttonColorClass}`}
            disabled={isPending}
          >
            {isPending ? (
              <Spinner />
            ) : showCheck ? (
              <Check size={18} />
            ) : showErrorFlash ? (
              <X size={18} />
            ) : (
              "Criar"
            )}
          </Button>
        </form>
      </Form>
    </>
  );
}