import { handleAuthCallback } from "@/features/auth/routes/callback";

export async function GET(request: Request) {
  return handleAuthCallback(request);
}
