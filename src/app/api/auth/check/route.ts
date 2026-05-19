import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const auth = await isAuthenticated();
  return Response.json({ authenticated: auth });
}
