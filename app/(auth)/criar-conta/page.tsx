// ============================================================
// 📝 PÁGINA DE REGISTRO (/criar-conta)
// ============================================================
// Esta página permite que novos usuários criem uma conta com
// nome, sobrenome, e-mail e senha.
//
// Layout: envolto pelo (auth)/layout.tsx, que mostra um Card
// centralizado na tela e redireciona se já estiver logado.
//
// Diferente do login, o registro NÃO oferece OAuth diretamente.
// O usuário pode se registrar por e-mail e depois vincular
// contas sociais no perfil.
// ============================================================

// Componentes do card de autenticação
import { CardContent } from "@/app/(auth)/components/card-content";
import { RaauthCardHeader } from "@/app/(auth)/components/raauth-card-header";
import { CardFooter } from "@/app/(auth)/components/card-footer";

// Formulário de registro (nome, sobrenome, e-mail, senha)
import { RegisterForm } from "@/components/auth/forms/register";
import {
  GithubOauthButton,
  GoogleOauthButton,
  MicrosoftOauthButton,
} from "@/components/auth/buttons/oauth-buttons";
import { Or } from "@/components/auth/or";

export default function RegisterPage() {
  return (
    <>
      {/* Cabeçalho: logo + "Criar sua conta" */}
      <RaauthCardHeader />

      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <MicrosoftOauthButton />
            <GoogleOauthButton />
            <GithubOauthButton />
          </div>

          <Or />

          {/* Formulário de registro */}
          <RegisterForm />
        </div>
      </CardContent>

      {/* Rodapé: "Já tem conta? Entrar" */}
      <CardFooter />
    </>
  );
}
