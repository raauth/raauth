"use client";

// dependências:
import { useRef } from "react";

// componentes:
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

// ícones:
import { Copy } from "lucide-react";

interface LinkButtonsProps {
  href: string;
}

export function LinkButtons({ href }: LinkButtonsProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const copy = () => {
    if (linkRef.current) {
      const content = linkRef.current.href;
      navigator.clipboard
        .writeText(content)
        .then(() => {
          toast.success('Link copiado para a área de transferência.')
        })
        .catch(() => {
          toast.error("Houve um erro ao copiar. Se ele persistir, tente recarregar a página.")
        })
    };
  };

  return (
    <>
      <Button asChild>
        <Link href={href} ref={linkRef}>
          Abrir
        </Link>
      </Button>
      <Button onClick={copy}>
        <Copy /> Copiar link
      </Button>
    </>
  )
}