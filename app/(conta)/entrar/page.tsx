// dependências:
import Link from "next/link";

// componentes:
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Lock } from "lucide-react";
import {
  GithubOauthButton,
  GoogleOauthButton,
  MicrosoftOauthButton,
} from "@/components/auth/buttons/oauth-buttons";
import { LoginForm } from "@/components/auth/forms/login";
import { Or } from "@/components/auth/or";

export default function Page() {
  return (
    <>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <Link href="/" className="font-averia text-3xl">
            raauth
          </Link>
          <Lock size={14} />
        </CardTitle>
        <CardDescription>
          Bem-vindo(a) de volta. Entre para continuar.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="grid grid-cols-3 space-x-2">
          <MicrosoftOauthButton />
          <GoogleOauthButton />
          <GithubOauthButton />
        </div>
        <Or />
        <LoginForm />
      </CardContent>
    </>
  );
}
