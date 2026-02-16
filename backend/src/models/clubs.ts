import mongoose from "mongoose";

const clubSchema = new mongoose.Schema({
  booqableProductId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  name: {
    type: String,
    required: true
  },

  sku: String,

  image: String,

  description: String,

  metadata: {
    type: Object,
    default: {}
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

export const CLUB= mongoose.model("CLUB",clubSchema)
