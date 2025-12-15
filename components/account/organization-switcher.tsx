<<<<<<< HEAD
"use client";

import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Organization } from "@/prisma/client/client";
import { authClient } from "@/lib/auth-client";

type OrganizationSwitcherProps = {
  organizations: Organization[];
};

export function OrganizationSwitcher({
  organizations,
}: OrganizationSwitcherProps) {
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const handleChangeOrganization = async (organizationId: string) => {
    try {
      const { error } = await authClient.organization.setActive({
        organizationId,
      });

      if (error) {
        console.error(error);
        toast.error("Failed to switch organization");
        return;
      }

      toast.success("Organization switched successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to switch organization");
    }
  };

  return (
    <Select
      onValueChange={handleChangeOrganization}
      value={activeOrganization?.id}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        {organizations.map((organization) => (
          <SelectItem key={organization.id} value={organization.id}>
            {organization.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
=======
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
>>>>>>> 1ecf572a5d6f511976ae300ee7457ebd1908b02a
