import { Types } from "mongoose";
import { User } from "../models/User";
import { IUser } from "../types/models";
import {
  CreateUserDto,
  UpdateUserDto,
  UserFilters,
  ServiceResponse,
} from "../types/services";

export class UserService {
  async create(userData: CreateUserDto): Promise<ServiceResponse<IUser>> {
    try {
      const existingUser = await User.findOne({
        $or: [{ username: userData.username }, { email: userData.email }],
      });

      if (existingUser) {
        return {
          success: false,
          error: "Username or email already exists",
        };
      }

      const user = new User(userData);
      await user.save();

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while creating user",
      };
    }
  }

  async findById(id: string | Types.ObjectId): Promise<ServiceResponse<IUser>> {
    try {
      const user = await User.findById(id);

      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while finding user",
      };
    }
  }

  async findAll(filters?: UserFilters): Promise<ServiceResponse<IUser[]>> {
    try {
      const query: any = {};

      if (filters) {
        if (filters.username) {
          query.username = { $regex: filters.username, $options: "i" };
        }
        if (filters.email) {
          query.email = { $regex: filters.email, $options: "i" };
        }
        if (filters.createdAfter) {
          query.createdAt = { ...query.createdAt, $gte: filters.createdAfter };
        }
        if (filters.createdBefore) {
          query.createdAt = { ...query.createdAt, $lte: filters.createdBefore };
        }
      }

      const users = await User.find(query);

      return {
        success: true,
        data: users,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while finding users",
      };
    }
  }

  async update(
    id: string | Types.ObjectId,
    updateData: UpdateUserDto
  ): Promise<ServiceResponse<IUser>> {
    try {
      if (updateData.email || updateData.username) {
        const query: any = {
          _id: { $ne: id },
        };

        if (updateData.username) {
          query.username = updateData.username;
        }
        if (updateData.email) {
          query.email = updateData.email;
        }

        const existingUser = await User.findOne(query);

        if (existingUser) {
          return {
            success: false,
            error: "Username or email already exists",
          };
        }
      }

      const user = await User.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while updating user",
      };
    }
  }

  async delete(id: string | Types.ObjectId): Promise<ServiceResponse<void>> {
    try {
      const user = await User.findByIdAndDelete(id);

      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while deleting user",
      };
    }
  }
}
