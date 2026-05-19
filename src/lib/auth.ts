import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import dbConnect from "./mongodb";
import User from "@/models/User";

const SESSION_COOKIE = "admin_session";
const SESSION_SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Create a simple session token */
function createToken(userId: string): string {
  // Simple base64 encoded token with timestamp
  const payload = JSON.stringify({ userId, ts: Date.now(), secret: SESSION_SECRET });
  return Buffer.from(payload).toString("base64");
}

/** Verify and decode a session token */
function verifyToken(token: string): { userId: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString());
    if (payload.secret !== SESSION_SECRET) return null;
    // Token valid for 24 hours
    if (Date.now() - payload.ts > 24 * 60 * 60 * 1000) return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

/** Login and set session cookie */
export async function loginAdmin(username: string, password: string): Promise<boolean> {
  await dbConnect();

  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user) return false;

  const valid = await verifyPassword(password, user.password);
  if (!valid) return false;

  const token = createToken(user._id.toString());
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60, // 24 hours
    path: "/",
  });

  return true;
}

/** Check if current request is authenticated */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifyToken(token) !== null;
}

/** Logout — clear session */
export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/** Seed default admin user if none exists */
export async function seedAdmin(): Promise<void> {
  await dbConnect();

  const existing = await User.countDocuments();
  if (existing > 0) return;

  const username = process.env.ADMIN_DEFAULT_USERNAME || "admin";
  const password = process.env.ADMIN_DEFAULT_PASSWORD || "admin123";

  await User.create({
    username,
    password: await hashPassword(password),
    role: "superadmin",
  });

  console.log(`Default admin created: ${username}`);
}
