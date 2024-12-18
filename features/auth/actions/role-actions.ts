"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "../utils/auth-utils";
import { Role, requireRole } from "../utils/role-utils";
import { revalidatePath } from "next/cache";

export async function assignRole(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  // Only admins can assign roles
  await requireRole(user.id, "admin");

  const userId = formData.get("userId") as string;
  const role = formData.get("role") as Role;

  if (!userId || !role) {
    throw new Error("User ID and role are required");
  }

  const supabase = await createClient();

  // Get the role ID
  const { data: roleData, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("name", role)
    .single();

  if (roleError || !roleData) {
    throw new Error("Role not found");
  }

  // Assign the role
  const { error } = await supabase
    .from("user_roles")
    .insert({
      user_id: userId,
      role_id: roleData.id,
    });

  if (error) {
    if (error.code === "23505") { // Unique violation
      throw new Error("User already has this role");
    }
    throw error;
  }

  revalidatePath("/admin/users");
}

export async function removeRole(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  // Only admins can remove roles
  await requireRole(user.id, "admin");

  const userId = formData.get("userId") as string;
  const role = formData.get("role") as Role;

  if (!userId || !role) {
    throw new Error("User ID and role are required");
  }

  const supabase = await createClient();

  // Get the role ID
  const { data: roleData, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("name", role)
    .single();

  if (roleError || !roleData) {
    throw new Error("Role not found");
  }

  // Remove the role
  const { error } = await supabase
    .from("user_roles")
    .delete()
    .match({
      user_id: userId,
      role_id: roleData.id,
    });

  if (error) {
    throw error;
  }

  revalidatePath("/admin/users");
} 