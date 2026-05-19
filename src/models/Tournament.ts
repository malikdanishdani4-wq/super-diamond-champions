import mongoose, { Schema, Document, Model } from "mongoose";

export type CompetitionType = "1-day" | "3-day" | "5-day" | "11-day" | "15-pigeon";
export type TournamentStatus = "upcoming" | "active" | "completed";

export interface ITournament extends Document {
  name: string;
  nameUrdu: string;
  season: string;
  competitionType: CompetitionType;
  startTime: string;
  endTime: string;
  totalDays: number;
  pigeonsPerLoft: number;
  dayDates: string[];
  dayDatesUrdu: string[];
  status: TournamentStatus;
  createdAt: Date;
}

const TournamentSchema = new Schema<ITournament>({
  name: { type: String, required: true },
  nameUrdu: { type: String, default: "" },
  season: { type: String, default: "" },
  competitionType: {
    type: String,
    enum: ["1-day", "3-day", "5-day", "11-day", "15-pigeon"],
    required: true,
  },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  totalDays: { type: Number, required: true },
  pigeonsPerLoft: { type: Number, required: true },
  dayDates: [{ type: String }],
  dayDatesUrdu: [{ type: String }],
  status: { type: String, enum: ["upcoming", "active", "completed"], default: "upcoming" },
  createdAt: { type: Date, default: Date.now },
});

const Tournament: Model<ITournament> =
  mongoose.models.Tournament || mongoose.model<ITournament>("Tournament", TournamentSchema);
export default Tournament;
