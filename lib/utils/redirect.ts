import { redirect } from "next/navigation";

type MessageType = "error" | "success";

export const encodedRedirect = (
  type: MessageType,
  path: string,
  message: string
) => {
  const searchParams = new URLSearchParams();
  searchParams.set("type", type);
  searchParams.set("message", message);
  return redirect(`${path}?${searchParams.toString()}`);
}; 