import mongoose from "mongoose";
import { ISocialAccount } from "../types/models";

const socialAccountSchema = new mongoose.Schema<ISocialAccount>(
  {
    platform: {
      type: String,
      required: true,
      enum: ["twitter", "instagram", "tiktok"],
    },
    accountId: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastFetched: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Bir kullanıcı-platform kombinasyonu için benzersiz index
socialAccountSchema.index(
  { userId: 1, platform: 1, accountId: 1 },
  { unique: true }
);

export const SocialAccount = mongoose.model<ISocialAccount>(
  "SocialAccount",
  socialAccountSchema
);
