import mongoose from "mongoose";

const loginTokenSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Auto delete expired tokens
loginTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const LoginToken = mongoose.model("LoginToken", loginTokenSchema);
