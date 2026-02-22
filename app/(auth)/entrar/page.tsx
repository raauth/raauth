// ============================================================
// 🔑 PÁGINA DE LOGIN (/entrar)
// ============================================================
// Esta página permite que usuários façam login na aplicação
// usando e-mail/senha ou login social (OAuth).
//
// Layout: envolto pelo (auth)/layout.tsx, que mostra um Card
// centralizado na tela e redireciona se já estiver logado.
//
// Componentes utilizados:
// - RaauthCardHeader: cabeçalho com logo e título
// - CardContent: wrapper para o conteúdo principal
// - OAuth buttons: botões de login social
// - Or: separador visual ("ou")
// - LoginForm: formulário de e-mail/senha
// - CardFooter: rodapé com link para registro
// ============================================================

// Componentes do card de autenticação
import { CardContent } from "@/app/(auth)/components/card-content";
import { RaauthCardHeader } from "@/app/(auth)/components/raauth-card-header";
import { CardFooter } from "@/app/(auth)/components/card-footer";

// Botões de login social (OAuth)
import {
  GithubOauthButton,
  GoogleOauthButton,
  MicrosoftOauthButton,
} from "@/components/auth/buttons/oauth-buttons";

// Formulário de login por e-mail/senha
import { LoginForm } from "@/components/auth/forms/login";

// Separador visual "ou" entre OAuth e e-mail
import { Or } from "@/components/auth/or";

export default function LoginPage() {
  return (
    <>
      {/* Cabeçalho: logo + "Entrar na sua conta" */}
      <RaauthCardHeader login />

      <CardContent>
        {/* Seção 1: botões de login social lado a lado */}
        <div className="grid grid-cols-3 space-x-2">
          <MicrosoftOauthButton />
          <GoogleOauthButton />
          <GithubOauthButton />
        </div>

        {/* Separador visual com texto "ou" */}
        <Or />

        {/* Seção 2: formulário de e-mail e senha */}
        <LoginForm />
      </CardContent>

      {/* Rodapé: "Não tem conta? Criar uma" */}
      <CardFooter login />
    </>
  );
}
