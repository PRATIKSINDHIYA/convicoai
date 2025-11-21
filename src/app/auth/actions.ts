"use server";

import * as z from "zod";

const formSchema = z.object({
  emailOrMobile: z.string(),
  password: z.string(),
});

export async function signIn(values: z.infer<typeof formSchema>) {
  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const validatedFields = formSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields provided." };
  }
  
  const { emailOrMobile } = validatedFields.data;

  // In a real app, you would fetch user from DB, check password hash, and create a session.
  console.log(`User signed in: ${emailOrMobile}`);

  return { success: "Logged in successfully!" };
}
