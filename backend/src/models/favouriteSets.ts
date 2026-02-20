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

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const Favourite = mongoose.model("FAVOURITE", favoriteSetSchema);
