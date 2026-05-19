import mongoose, { Schema, Document, Model } from "mongoose";

export interface PigeonLanding {
  pigeonNumber: number;
  landingTime: string; // "HH:MM:SS" or "00:00:00" for not landed
}

export interface IDayResult extends Document {
  tournamentId: mongoose.Types.ObjectId;
  loftId: mongoose.Types.ObjectId;
  dayNumber: number;
  pigeonLandings: PigeonLanding[];
  braveChildTime: string;
  totalDayDuration: string;
  position: number;
  createdAt: Date;
}

const DayResultSchema = new Schema<IDayResult>({
  tournamentId: { type: Schema.Types.ObjectId, ref: "Tournament", required: true, index: true },
  loftId: { type: Schema.Types.ObjectId, ref: "Loft", required: true },
  dayNumber: { type: Number, required: true },
  pigeonLandings: [{
    pigeonNumber: { type: Number, required: true },
    landingTime: { type: String, default: "00:00:00" },
  }],
  braveChildTime: { type: String, default: "00:00:00" },
  totalDayDuration: { type: String, default: "00:00:00" },
  position: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

DayResultSchema.index({ tournamentId: 1, loftId: 1, dayNumber: 1 }, { unique: true });

const DayResult: Model<IDayResult> =
  mongoose.models.DayResult || mongoose.model<IDayResult>("DayResult", DayResultSchema);
export default DayResult;
