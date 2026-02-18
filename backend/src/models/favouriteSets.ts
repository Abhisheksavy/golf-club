import mongoose from "mongoose";

const favoriteSetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    setName: {
      type: String,
      required: true,
      trim: true,
    },

    clubs: [{ type: String }],
  },
  { timestamps: true }
);

export const Favourite = mongoose.model("FAVOURITE", favoriteSetSchema);
