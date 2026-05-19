import { type NextRequest } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { isAuthenticated } from "@/lib/auth";
import DayResult from "@/models/DayResult";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const day = request.nextUrl.searchParams.get("day");
    await dbConnect();

    // Query with BOTH ObjectId and string to match results regardless of how they were stored
    const possibleIds: (mongoose.Types.ObjectId | string)[] = [id];
    try {
      possibleIds.push(new mongoose.Types.ObjectId(id));
    } catch {
      // id is not a valid ObjectId format, just use string
    }

    const query: Record<string, unknown> = { tournamentId: { $in: possibleIds } };
    if (day) query.dayNumber = parseInt(day);

    const results = await DayResult.find(query)
      .populate("loftId")
      .sort({ position: 1 })
      .lean();

    return Response.json(results);
  } catch (error) {
    console.error("Error fetching results:", error);
    return Response.json({ error: "Failed to fetch results" }, { status: 500 });
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

    // Convert tournamentId to ObjectId for consistent storage
    let tournamentId: mongoose.Types.ObjectId | string;
    try {
      tournamentId = new mongoose.Types.ObjectId(id);
    } catch {
      tournamentId = id;
    }

    // Auto-calculate totalDayDuration from pigeon landing times only
    // (Brave child is a separate pigeon and NOT included in the total)
    let totalSeconds = 0;
    if (body.pigeonLandings && Array.isArray(body.pigeonLandings)) {
      for (const p of body.pigeonLandings) {
        if (p.landingTime && p.landingTime !== "00:00:00") {
          const parts = p.landingTime.split(":").map(Number);
          totalSeconds += (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
        }
      }
    }

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const totalDayDuration = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

    // Upsert — update if exists, create if not
    // Search with $in to find existing records stored as either string or ObjectId
    const possibleIds: (mongoose.Types.ObjectId | string)[] = [id];
    try { possibleIds.push(new mongoose.Types.ObjectId(id)); } catch { /* ignore */ }

    const result = await DayResult.findOneAndUpdate(
      { tournamentId: { $in: possibleIds }, loftId: body.loftId, dayNumber: body.dayNumber },
      { ...body, tournamentId, totalDayDuration },
      { upsert: true, new: true }
    );

    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error("Error saving result:", error);
    return Response.json({ error: "Failed to save result" }, { status: 500 });
  }
}
