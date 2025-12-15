import { db } from "@/lib/db"

export const getAllUsers = async (organizationId: string) => {
  try {
    const members = await db.member.findMany({
      where: {
        organizationId,
      },
    })
    const users = await db.user.findMany({
      where: {
        id: {
          notIn: members.map((member) => member.userId),
        },
      },
    })
    
    return users
  } catch (error) {
    console.log(error)
    return null
  }  
} 