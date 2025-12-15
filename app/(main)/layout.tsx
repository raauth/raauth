import { Header } from "@/components/structure/header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return(
    <>
    <Header />
      <main className="container mx-auto px-4 py-4">
        { children }
      </main>
    </>
  );
}