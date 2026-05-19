import { seedAdmin } from "@/lib/auth";

export async function POST() {
  try {
    await seedAdmin();
    return Response.json({ success: true, message: "Admin seeded" });
  } catch (error) {
    console.error("Seed error:", error);
    return Response.json({ error: "Seed failed" }, { status: 500 });
  }
}
