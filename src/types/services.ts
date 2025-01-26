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
