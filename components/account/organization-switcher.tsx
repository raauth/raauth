"use client"

// libs e funções:
import { authClient } from "@/lib/auth-client";
import { type Organization } from "@/prisma/client/client";
import { useRouter } from "next/navigation";

// componentes:
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

// icons:
import { ArrowDownUp, BriefcaseBusiness, Check, PlusCircle } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

interface OrganizationSwitcherProps {
  organizations: Organization[]
}

function SkeletonOrganization() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="size-4 rounded-full" />
      <Skeleton className="w-20 h-4" />
    </div>
  )
}

export function OrganizationSwitcher({ organizations }: OrganizationSwitcherProps) {
  const router = useRouter();
  const { data: activeOrganization, isPending } = authClient.useActiveOrganization();

  // Se houver apenas uma organização (ou nenhuma), exibe apenas o item desabilitado
  if (organizations.length <= 1) {
    return (
      <DropdownMenuItem disabled>
        { isPending ? (
          <SkeletonOrganization />
        ) : (
          <>
            <BriefcaseBusiness />
            {activeOrganization?.name}
          </>
        )}
      </DropdownMenuItem>
    )
  }

  if (isPending) {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <SkeletonOrganization />
        </DropdownMenuSubTrigger>
      </DropdownMenuSub>
    )
  }

  const handleChangeOrganization = async (organizationId: string) => {
    toast.promise(
      authClient.organization.setActive({
        organizationId,
      }),
      {
        loading: "Alterando organização",
        success: "Organização alterada",
        error: "Houve um erro inesperado ao alterar organização",
      }
    );
    router.refresh();
  };

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        {activeOrganization?.name ? (
          <>
            <BriefcaseBusiness />
            {activeOrganization.name}
          </>
        ) : (
          <SkeletonOrganization />
        )}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuLabel className="flex items-center gap-2 text-muted-foreground">
            <ArrowDownUp className="size-4" />
            Selecione uma organização
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={activeOrganization?.id} onValueChange={handleChangeOrganization}>
            {organizations.map((organization) => (
              <DropdownMenuRadioItem key={organization.id} value={organization.id}>
                {organization.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/create-organization")}>
            <PlusCircle className="size-4" />
            Criar nova organização
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}
