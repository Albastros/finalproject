import mongoose, { Schema } from "mongoose";

const etnPayoutSchema = new Schema({
  etnId: { type: String, required: true },
  amount: { type: Number, required: true },
  paidAt: { type: Date, default: Date.now },
  paidBy: { type: String, required: true }, // admin ID
});

export default mongoose.models.ETNPayout || mongoose.model("ETNPayout", etnPayoutSchema);
