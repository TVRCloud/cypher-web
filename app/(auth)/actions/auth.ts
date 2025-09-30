"use server";

import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import {
  hashPassword,
  verifyPassword,
  setSession,
  clearSession,
} from "@/lib/auth";
import Admin from "@/models/Admins";

function getCurrentDateTime() {
  const now = new Date();
  const date = now.toLocaleDateString("en-GB").replace(/\//g, "-");
  const time = now.toLocaleTimeString("en-GB", { hour12: false });
  return { date, time };
}

export async function registerAction(
  prevState: { message: string } | undefined,
  formData: FormData
): Promise<{ message: string }> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { message: "Name, email, and password are required" };
  }

  await connectDB();

  const existingUser = await Admin.findOne({ email });
  if (existingUser) {
    return { message: "User already exists" };
  }

  const { date, time } = getCurrentDateTime();

  const hashedPassword = await hashPassword(password);
  const user = await Admin.create({
    userId: crypto.randomUUID(),
    email,
    password: hashedPassword,
    role: "user",
    date,
    time,
  });

  await setSession(user);

  redirect("/dashboard");
}

export async function loginAction(
  prevState: { message: string } | undefined,
  formData: FormData
): Promise<{ message: string }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { message: "Email and password are required" };
  }

  await connectDB();

  const user = await Admin.findOne({ email });
  if (!user) {
    return { message: "User not found" };
  }

  console.log(password, user.password.trim());

  const isValid = await verifyPassword(password, user.password.trim());

  console.log(isValid);

  if (!isValid) {
    return { message: "Invalid password" };
  }

  await setSession(user);

  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
