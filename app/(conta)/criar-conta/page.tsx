import { RegisterForm } from "@/components/auth/forms/register";
import { Or } from "@/components/auth/or";

// componentes:
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock } from "lucide-react";
import Link from "next/link";

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
        <RegisterForm />
      </CardContent>
    </>
  );
}
