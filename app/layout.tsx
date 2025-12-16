// dependências:
import type { Metadata } from "next";

// arquivos:
import "./globals.css";

// fontes:
import { Averia_Serif_Libre, Geist, Geist_Mono } from "next/font/google";

// componentes:
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/sonner"

// instanciamento das fontes:
const averia = Averia_Serif_Libre({
  weight: ["300", "400", "700"],
  style: "normal",
  variable: "--font-averia",
  subsets: ["latin"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// definição de metadados globais:
export const metadata: Metadata = {
  title: {
    template: "Raauth: %s",
    default: "Raauth",
  },
  generator: "Next.js",
  applicationName: "raauth",
  authors: [{ name: "Raave Aires", url: "https://githb.com/raave-aires" }],
  creator: "Raave Aires",
  publisher: "Raave Aires",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="overflow-x-hidden no-scrollbar">
      <body
        className={`${averia.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
