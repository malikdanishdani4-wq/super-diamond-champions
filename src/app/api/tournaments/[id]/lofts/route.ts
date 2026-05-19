import { type NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import { isAuthenticated } from "@/lib/auth";
import Loft from "@/models/Loft";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const lofts = await Loft.find({ tournamentId: id }).sort({ loftNumber: 1 });
    return Response.json(lofts);
  } catch (error) {
    console.error("Error fetching lofts:", error);
    return Response.json({ error: "Failed to fetch lofts" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await isAuthenticated();
    if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await dbConnect();
    const body = await request.json();

    const loft = await Loft.create({
      ...body,
      tournamentId: id,
    });

    return Response.json(loft, { status: 201 });
  } catch (error) {
    console.error("Error creating loft:", error);
    return Response.json({ error: "Failed to create loft" }, { status: 500 });
  }
}
