"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function submitPassword(formData: FormData) {
  const entered = formData.get("password") as string;
  const correct = process.env.BETA_PASSWORD;

  if (!correct || entered !== correct) {
    redirect("/access?error=1");
  }

  const jar = await cookies();
  jar.set("allegro-access", correct, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    // Session cookie — clears when browser closes
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  redirect("/");
}
