import { Header } from "@/components/structure/header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return(
    <>
    <Header />
      <main>
        { children }
      </main>
    </>
  );
}