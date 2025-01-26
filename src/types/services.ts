import { Types } from "mongoose";

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
}

export interface UserFilters {
  username?: string;
  email?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateSocialAccountDto {
  platform: "twitter" | "instagram" | "tiktok";
  accountId: string;
  username: string;
  userId: string | Types.ObjectId;
}

export interface UpdateSocialAccountDto {
  username?: string;
  lastFetched?: Date;
}

export interface SocialAccountFilters {
  platform?: "twitter" | "instagram" | "tiktok";
  username?: string;
  userId?: string | Types.ObjectId;
  lastFetchedBefore?: Date;
  lastFetchedAfter?: Date;
}
