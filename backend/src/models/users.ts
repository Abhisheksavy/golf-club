import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    password: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);


export const USER = mongoose.model("USER", userSchema);

