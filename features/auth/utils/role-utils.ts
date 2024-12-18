import { createClient } from "@/lib/supabase/server";

export type Role = "admin" | "manager" | "user";

interface RoleResponse {
  roles: {
    name: string;
  };
}

export async function getUserRoles(userId: string): Promise<Role[]> {
  const supabase = await createClient();
  
  const { data: roles, error } = await supabase
    .from("user_roles")
    .select("roles:role_id(name)")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user roles:", error);
    return [];
  }

  return (roles || []).map((role: any) => role.roles.name as Role);
}

export async function hasRole(userId: string, role: Role): Promise<boolean> {
  const roles = await getUserRoles(userId);
  return roles.includes(role);
}

export async function requireRole(userId: string, role: Role): Promise<void> {
  const hasRequiredRole = await hasRole(userId, role);
  if (!hasRequiredRole) {
    throw new Error(`Access denied. Required role: ${role}`);
  }
}

export async function isAdmin(userId: string): Promise<boolean> {
  return hasRole(userId, "admin");
}

export async function isManager(userId: string): Promise<boolean> {
  return hasRole(userId, "manager");
}

export function createRoleMiddleware(role: Role) {
  return async (userId: string) => {
    await requireRole(userId, role);
  };
} 