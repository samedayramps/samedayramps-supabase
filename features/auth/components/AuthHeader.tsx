import { signOutAction } from "../actions/sign-out-action";
import { getCurrentUser } from "../utils/auth-utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RoleBasedNav } from "./RoleBasedNav";

export async function AuthHeader() {
  const user = await getCurrentUser();

  return user ? (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span>{user.email}</span>
        <RoleBasedNav userId={user.id} />
      </div>
      <form action={signOutAction}>
        <Button type="submit" variant="outline">
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant="default">
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
} 