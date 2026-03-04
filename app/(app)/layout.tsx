// ============================================================
// 📱 LAYOUT DA APLICAÇÃO (Grupo de Rotas: app)
// ============================================================
// Layout base das páginas autenticadas sem header global.
// O conteúdo principal fica centralizado no container.
// ============================================================

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className="h-svh overflow-auto">{children}</main>;
}
