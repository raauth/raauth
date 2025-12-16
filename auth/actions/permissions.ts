"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export const isAdmin = async () => {
  try {
    const { success, error } = await auth.api.hasPermission({
    headers: await headers(),
    body: {
      permission: {
        organization: ["update", "delete"],
      }
    }
  });

  if(error){
    return {
      success: false,
      error: error || "Voce não tem permissão para realizar esta ação"
    }
  }

  return success
  } catch (error) {
    return {
      success: false,
      error: error || "Voce não tem permissão para realizar esta ação"
    }
  }
}