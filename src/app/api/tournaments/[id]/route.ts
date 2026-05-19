import { type NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import { isAuthenticated } from "@/lib/auth";
import Tournament from "@/models/Tournament";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const tournament = await Tournament.findById(id);
    if (!tournament) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(tournament);
  } catch (error) {
    console.error("Error fetching tournament:", error);
    return Response.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await isAuthenticated();
    if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await dbConnect();
    const body = await request.json();
    const tournament = await Tournament.findByIdAndUpdate(id, body, { new: true });
    if (!tournament) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(tournament);
  } catch (error) {
    console.error("Error updating tournament:", error);
    return Response.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await isAuthenticated();
    if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await dbConnect();
    await Tournament.findByIdAndDelete(id);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting tournament:", error);
    return Response.json({ error: "Failed to delete" }, { status: 500 });
  }
}
