// ============================================================
// 🌐 CONFIGURAÇÃO DO BETTER AUTH (Lado do Cliente)
// ============================================================
// Este arquivo configura o Better Auth para uso em componentes
// CLIENT-SIDE ("use client"). É o espelho do lib/auth.ts, mas
// para o navegador.
//
// 📌 DIFERENÇA SERVER vs CLIENT:
// - lib/auth.ts → roda no SERVIDOR (acessa banco, segredos)
// - lib/auth-client.ts → roda no NAVEGADOR (chama APIs)
//
// O authClient faz chamadas HTTP para /api/auth/* e o Better Auth
// no servidor processa as requisições.
//
// 🐤 Analogia: o auth.ts é o porteiro do prédio (servidor),
// e o auth-client.ts é o interfone do apartamento (navegador).
// O interfone não abre a porta sozinho — ele pede ao porteiro.
//
// 💡 PONTO DE EXTENSÃO: ao adicionar plugins no auth.ts,
// adicione o equivalente client aqui. Ex:
//   twoFactor → twoFactorClient
//   passkey → passkeyClient
// ============================================================

import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

// Importa as mesmas permissões do servidor para que o client
// possa fazer verificações de permissão localmente (sem API call)
// Ex: authClient.organization.checkRolePermission(...)
import { ac, owner, admin, member } from "@/server/permissions";

// ── Instância do Auth Client ──────────────────────────────
// Todos os componentes "use client" importam isto para:
// - authClient.signIn.email() → fazer login
// - authClient.signUp.email() → criar conta
// - authClient.signIn.social() → login OAuth
// - authClient.useSession() → hook React para sessão
// - authClient.signOut() → fazer logout
// - authClient.organization.* → gerenciar organizações
export const authClient = createAuthClient({
  // A URL base para as chamadas de API.
  // Em desenvolvimento: http://localhost:3000
  // Em produção: https://seudominio.com
  baseURL: process.env.BETTER_AUTH_URL,

  // Plugins do lado do client — devem espelhar os do servidor.
  plugins: [
    // Plugin de organização (client-side):
    // Adiciona métodos como:
    // - authClient.organization.create()
    // - authClient.organization.setActive()
    // - authClient.organization.inviteMember()
    // - authClient.organization.listMembers()
    // - authClient.organization.hasPermission()
    organizationClient({
      ac,
      roles: {
        owner,
        admin,
        member,
      },
    }),
  ],
});