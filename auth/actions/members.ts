"use server"

import { auth } from "@/lib/auth"

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
