import { Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISocialAccount extends Document {
  _id: Types.ObjectId;
  platform: "twitter" | "instagram" | "tiktok";
  accountId: string;
  username: string;
  userId: Types.ObjectId;
  lastFetched: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContent extends Document {
  _id: Types.ObjectId;
  type: "text" | "video";
  originalContent: string;
  processedContent?: string;
  socialAccountId: Types.ObjectId;
  platform: ISocialAccount["platform"];
  postedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
