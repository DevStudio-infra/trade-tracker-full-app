"use server";

import { auth } from "@/auth";
import { userNameSchema } from "@/lib/validations/user";
import { revalidatePath } from "next/cache";

export type FormData = {
  name: string;
};

export async function updateUserName(userId: string, data: FormData) {
  try {
    const session = await auth()

    if (!session?.user || session?.user.id !== userId) {
      throw new Error("Unauthorized");
    }

    const { name } = userNameSchema.parse(data);

    // Call the server endpoint to update the user name
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/name`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error('Failed to update user name');
    }

    revalidatePath('/dashboard/settings');
    return { status: "success" };
  } catch (error) {
    console.error('Error updating user name:', error);
    return { status: "error" }
  }
}
