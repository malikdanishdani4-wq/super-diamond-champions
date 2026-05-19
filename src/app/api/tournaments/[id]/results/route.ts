import { type NextRequest } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { isAuthenticated } from "@/lib/auth";
import DayResult from "@/models/DayResult";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const day = request.nextUrl.searchParams.get("day");
    await dbConnect();

    // Build query — try ObjectId first, then string fallback
    let objectId: mongoose.Types.ObjectId | null = null;
    try {
      objectId = new mongoose.Types.ObjectId(id);
    } catch {
      // not a valid ObjectId format
    }

    const buildQuery = (tid: mongoose.Types.ObjectId | string) => {
      const q: Record<string, unknown> = { tournamentId: tid };
      if (day) q.dayNumber = parseInt(day);
      return q;
    };

    // First try with ObjectId (matches the schema type)
    let results: unknown[] = [];
    if (objectId) {
      results = await DayResult.find(buildQuery(objectId))
        .populate("loftId")
        .sort({ position: 1 })
        .lean();
    }

    // Fallback: query directly via native driver to bypass Mongoose casting
    // This handles cases where tournamentId was stored as a string
    if (results.length === 0) {
      const nativeQuery: Record<string, unknown> = { tournamentId: id };
      if (day) nativeQuery.dayNumber = parseInt(day);

      const db = mongoose.connection.db;
      if (db) {
        const nativeResults = await db
          .collection("dayresults")
          .find(nativeQuery)
          .sort({ position: 1 })
          .toArray();

        if (nativeResults.length > 0) {
          // Manually populate loftId
          const Loft = mongoose.models.Loft;
          const loftIds = nativeResults.map((r) => r.loftId).filter(Boolean);
          const lofts = await Loft.find({ _id: { $in: loftIds } }).lean();
          const loftMap = new Map(lofts.map((l: Record<string, unknown>) => [String(l._id), l]));

          results = nativeResults.map((r) => ({
            ...r,
            loftId: loftMap.get(String(r.loftId)) || r.loftId,
          }));
        }
      }
    }

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

    // Convert tournamentId to ObjectId for consistent storage (matches schema)
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
    const result = await DayResult.findOneAndUpdate(
      { tournamentId, loftId: body.loftId, dayNumber: body.dayNumber },
      { ...body, tournamentId, totalDayDuration },
      { upsert: true, new: true }
    );

    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error("Error saving result:", error);
    return Response.json({ error: "Failed to save result" }, { status: 500 });
  }
}

