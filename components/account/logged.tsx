"use client";

// funções e libs:
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

// componentes:
import { AccessLevelIcon } from "@/components/account/access-level-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ícones:
import { LogOut, SquareUser } from "lucide-react";


interface LoggedAccountProps {
  session?: {
    user?: {
      name?: string | null;
      role?: string | null;
      image?: string | null;
    } | null;
  } | null;
}

export function LoggedAccount({ session }: LoggedAccountProps) {
  const router = useRouter();

  return (
    <>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 select-none group">
          <div className="flex flex-col text-end">
            <span className="text-primary underline-offset-4 group-hover:underline text-sm font-medium">
              {session?.user?.name?.split(" ")[0]}
            </span>
            <span className="text-primary text-xs">Amper Elinsa</span>
          </div>
          <Avatar>
            <AvatarImage src={session?.user?.image || undefined }
              alt="@evilrabbit" />
            <AvatarFallback><SquareUser /></AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {/* Conteúdo do menu suspenso vai aqui */}
        <DropdownMenuLabel>Olá, {session?.user?.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <AccessLevelIcon level={session?.user?.role} />
          <DropdownMenuItem
            variant="destructive"
            onClick={async () => {
              await authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    router.push("/entrar"); // redirect to login page
                  },
                },
              });
            }}
          >
            <LogOut /> Sair
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </>
  );
}
