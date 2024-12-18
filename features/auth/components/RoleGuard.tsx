import { getCurrentUser } from "../utils/auth-utils";
import { Role, hasRole } from "../utils/role-utils";
import { ReactNode } from "react";

interface RoleGuardProps {
  role: Role;
  children: ReactNode;
}

export async function RoleGuard({ role, children }: RoleGuardProps) {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  const hasRequiredRole = await hasRole(user.id, role);

  if (!hasRequiredRole) {
    return null;
  }

  return <>{children}</>;
}

interface RoleContentProps {
  roles: Role[];
  children: ReactNode;
}

export async function RoleContent({ roles, children }: RoleContentProps) {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  const userRoles = await Promise.all(roles.map(role => hasRole(user.id, role)));
  const hasAnyRole = userRoles.some(Boolean);

  if (!hasAnyRole) {
    return null;
  }

  return <>{children}</>;
} 