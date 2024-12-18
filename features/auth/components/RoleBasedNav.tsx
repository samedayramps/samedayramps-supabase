"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Role } from "../utils/role-utils";

interface RoleBasedNavProps {
  userId: string;
}

export function RoleBasedNav({ userId }: RoleBasedNavProps) {
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    async function fetchRoles() {
      const response = await fetch(`/api/auth/roles?userId=${userId}`);
      const data = await response.json();
      setRoles(data.roles);
    }
    fetchRoles();
  }, [userId]);

  return (
    <>
      {roles.includes("admin") && (
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            Admin Dashboard
          </Button>
        </Link>
      )}
      {roles.includes("manager") && (
        <Link href="/manager">
          <Button variant="ghost" size="sm">
            Manager Dashboard
          </Button>
        </Link>
      )}
    </>
  );
} 