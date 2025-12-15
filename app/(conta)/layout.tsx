import { Card } from "@/components/ui/card";
import { getServerSession } from "@/auth/actions/session";
import { redirect } from "next/navigation";

export default async function CardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  if (session) {
    return redirect("/");
  }

  return (
    <main className="min-w-dvw min-h-dvh flex justify-center items-center">
      <Card className="min-w-[24rem] max-w-108">{children}</Card>
    </main>
  );
}
