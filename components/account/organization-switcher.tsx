"use client"

// libs e funções:
import { authClient } from "@/lib/auth-client";

import { type Organization } from "@/prisma/client/client";

interface OrganizationSwitcherProps {
 organizations: Organization[]
}

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function OrganizationSwitcher({organizations}: OrganizationSwitcherProps) {
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const handleChangeOrganization = async (organizationId: string) => {
    await authClient.organization.setActive({
      organizationId,
    });
  };

  return(
    <Select 
      onValueChange={handleChangeOrganization} 
      defaultValue={activeOrganization?.id}
    >
      <SelectTrigger>
        <SelectValue placeholder="Selecione uma organização" />
      </SelectTrigger>
      <SelectContent>
        {organizations.map((organization) => (
          <SelectItem key={organization.id} value={organization.id}>
            {organization.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}