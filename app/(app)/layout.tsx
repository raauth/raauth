// ============================================================
// 📱 LAYOUT DA APLICAÇÃO (Grupo de Rotas: app)
// ============================================================
// Layout base das páginas autenticadas sem header global.
// Aplica guarda de sessão para toda rota dentro de /(app).
// ============================================================

import { redirect } from "next/navigation";

import { getServerSession } from "@/server/actions/session";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  if (!session) {
    redirect("/entrar");
  }

  return <main className="h-svh overflow-hidden">{children}</main>;
}
