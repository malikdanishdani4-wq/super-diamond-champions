import { type NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import { isAuthenticated } from "@/lib/auth";
import Loft from "@/models/Loft";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; loftId: string }> }
) {
  try {
    const auth = await isAuthenticated();
    if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { loftId } = await params;
    await dbConnect();
    const body = await request.json();
    const loft = await Loft.findByIdAndUpdate(loftId, body, { new: true });
    if (!loft) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(loft);
  } catch (error) {
    console.error("Error updating loft:", error);
    return Response.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; loftId: string }> }
) {
  try {
    const auth = await isAuthenticated();
    if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { loftId } = await params;
    await dbConnect();
    await Loft.findByIdAndDelete(loftId);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting loft:", error);
    return Response.json({ error: "Failed to delete" }, { status: 500 });
  }
}
