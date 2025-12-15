"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers";

// função para adicionar um membro a uma organização
interface AddMemberProps {
  organizationId: string;
  userId: string;
  role: "member" | "owner" | "admin";
}

interface AddMemberResult {
  success: boolean;
}

export async function addMember(
  _prevState: AddMemberResult | null,
  { organizationId, userId, role }: AddMemberProps
): Promise<AddMemberResult> {
  try {
    await auth.api.addMember({
      body: {
        userId,
        organizationId,
        role
      }
    })
    return { success: true }
  } catch (error) {
    console.log(error)
    return { success: false }
  }
}

// função para remover um membro de uma organização
interface RemoveMemberProps {
  userId: string;
  organizationId: string;
}

interface RemoveMemberResult {
  success: boolean;
}

export async function removeMember(
  _prevState: RemoveMemberResult | null,
  { organizationId, userId }: RemoveMemberProps
): Promise<RemoveMemberResult> {
  try {
    await auth.api.removeMember({
      body: {
        memberIdOrEmail: userId, // required
        organizationId,
      },

      headers: await headers()
    })
    return { success: true }
  } catch (error) {
    console.log(error)
    return { success: false }
  }
}