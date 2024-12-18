import { ProtectedPageContent } from "@/features/auth/components/ProtectedPageContent";
import { requireAuth } from "@/features/auth/utils/auth-utils";

export default async function ProtectedPage() {
  const user = await requireAuth();
  return <ProtectedPageContent user={user} />;
}
