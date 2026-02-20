import mongoose from "mongoose";

const deletionLogSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      required: true,
      trim: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    entitySnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

export const DeletionLog = mongoose.model("DELETION_LOG", deletionLogSchema);
