import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILoft extends Document {
  tournamentId: mongoose.Types.ObjectId;
  loftNumber: number;
  ownerName: string;
  ownerNameUrdu: string;
  area: string;
  areaUrdu: string;
  totalPigeons: number;
  createdAt: Date;
}

const LoftSchema = new Schema<ILoft>({
  tournamentId: { type: Schema.Types.ObjectId, ref: "Tournament", required: true, index: true },
  loftNumber: { type: Number, required: true },
  ownerName: { type: String, required: true },
  ownerNameUrdu: { type: String, default: "" },
  area: { type: String, default: "" },
  areaUrdu: { type: String, default: "" },
  totalPigeons: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

LoftSchema.index({ tournamentId: 1, loftNumber: 1 }, { unique: true });

const Loft: Model<ILoft> = mongoose.models.Loft || mongoose.model<ILoft>("Loft", LoftSchema);
export default Loft;
