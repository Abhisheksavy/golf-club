import mongoose from "mongoose";

const clubSchema = new mongoose.Schema({
  booqableProductId: { type: String, required: true, unique: true, index: true }
}, { timestamps: true });

export const CLUB = mongoose.model("CLUB", clubSchema);
