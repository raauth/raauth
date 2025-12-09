// componentes:
import { Logo } from "@/components/structure/logo";

// ícones:
import { ThemeToggle } from "../ui/theme-toggle";

export function Header() {
  return (
    <>
      <header className="sticky h-14 min-w-dvw max-w-dvw top-0 flex justify-center items-center bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60 border-b border-border z-50">
        <nav className="container flex items-center justify-between">
          <Logo />
          
          <ThemeToggle />
        </nav>
      </header>
    </>
  );
}