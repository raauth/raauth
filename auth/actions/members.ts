"use server"

import { auth } from "@/lib/auth"
import { toast } from "sonner";

interface AddMemberProps {
  organizationId: string;
  userId: string;
  role: "member" | "owner" | "admin";
}

export async function addMember({ organizationId, userId, role }: AddMemberProps) {
  try {
    await auth.api.addMember({
      body: {
        userId,
        organizationId,
        role
      }
    })

    toast.success("Membro adicionado com sucesso.")
  } catch (error) {
    console.log(error)
    toast.error("Ocorreu um erro inesperado ao adicionar membro. Tente novamente.")
  }
}
