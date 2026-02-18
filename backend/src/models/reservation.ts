import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "USER",
      required: true,
      index: true,
    },
    course: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    clubs: [{ type: String }],
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "confirmed",
    },
    savedAsBag: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FAVOURITE",
    },
  },
  { timestamps: true }
);

export const Reservation = mongoose.model("Reservation", reservationSchema);
