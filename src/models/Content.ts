import mongoose from "mongoose";
import { IContent } from "../types/models";

const contentSchema = new mongoose.Schema<IContent>(
  {
    type: {
      type: String,
      required: true,
      enum: ["text", "video"],
    },
    originalContent: {
      type: String,
      required: true,
    },
    processedContent: {
      type: String,
      default: null,
    },
    socialAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SocialAccount",
      required: true,
    },
    platform: {
      type: String,
      required: true,
      enum: ["twitter", "instagram", "tiktok"],
    },
    postedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Platform ve sosyal medya hesabı için index
contentSchema.index({ socialAccountId: 1, platform: 1, postedAt: -1 });

export const Content = mongoose.model<IContent>("Content", contentSchema);
