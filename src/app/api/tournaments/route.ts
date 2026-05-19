import { type NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import { isAuthenticated } from "@/lib/auth";
import Tournament from "@/models/Tournament";

export async function GET() {
  try {
    await dbConnect();
    const tournaments = await Tournament.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "lofts",
          localField: "_id",
          foreignField: "tournamentId",
          as: "loftsData",
        },
      },
      {
        $addFields: {
          loftsCount: { $size: "$loftsData" },
        },
      },
      {
        $project: {
          loftsData: 0,
        },
      },
    ]);
    return Response.json(tournaments);
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    return Response.json({ error: "Failed to fetch tournaments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await isAuthenticated();
    if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const body = await request.json();

    // Auto-set totalDays based on competition type
    const typeDefaults: Record<string, { totalDays: number; defaultPigeons: number }> = {
      "1-day": { totalDays: 1, defaultPigeons: 11 },
      "3-day": { totalDays: 3, defaultPigeons: 11 },
      "5-day": { totalDays: 5, defaultPigeons: 11 },
      "11-day": { totalDays: 11, defaultPigeons: 11 },
      "15-pigeon": { totalDays: 1, defaultPigeons: 15 },
    };

    const defaults = typeDefaults[body.competitionType] || { totalDays: 1, defaultPigeons: 11 };

    const tournament = await Tournament.create({
      ...body,
      totalDays: defaults.totalDays,
      pigeonsPerLoft: body.pigeonsPerLoft || defaults.defaultPigeons,
    });

    return Response.json(tournament, { status: 201 });
  } catch (error) {
    console.error("Error creating tournament:", error);
    return Response.json({ error: "Failed to create tournament" }, { status: 500 });
  }
}
