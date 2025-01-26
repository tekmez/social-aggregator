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
  /**
   * Creates a new user
   * @param userData User data to be created
   * @returns ServiceResponse<IUser>
   * @throws Validation error if username or email already exists
   */
  async create(userData: CreateUserDto): Promise<ServiceResponse<IUser>> {
    try {
      // Check for existing user with same username or email
      const existingUser = await User.findOne({
        $or: [{ username: userData.username }, { email: userData.email }],
      });

      if (existingUser) {
        return {
          success: false,
          error: "Username or email already exists",
        };
      }

      // Create and save new user
      const user = new User(userData);
      await user.save();

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      // Handle mongoose validation errors
      if (error instanceof Error && error.name === "ValidationError") {
        return {
          success: false,
          error: "Invalid user data provided",
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create user",
      };
    }
  }

  /**
   * Finds a user by their ID
   * @param id User ID to search for
   * @returns ServiceResponse<IUser>
   */
  async findById(id: string | Types.ObjectId): Promise<ServiceResponse<IUser>> {
    try {
      // Handle invalid ObjectId before query
      if (!Types.ObjectId.isValid(id)) {
        return {
          success: false,
          error: "Invalid user ID format",
        };
      }

      const user = await User.findById(id).select("-password");

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
      // Handle invalid ObjectId
      if (error instanceof Error && error.name === "CastError") {
        return {
          success: false,
          error: "Invalid user ID format",
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to find user",
      };
    }
  }

  /**
   * Finds users based on provided filters
   * @param filters Optional filters for username, email, and creation date
   * @returns ServiceResponse<IUser[]>
   */
  async findAll(filters?: UserFilters): Promise<ServiceResponse<IUser[]>> {
    try {
      const query: any = {};

      if (filters) {
        // Apply username filter with case-insensitive search
        if (filters.username) {
          query.username = { $regex: filters.username, $options: "i" };
        }

        // Apply email filter with case-insensitive search
        if (filters.email) {
          query.email = { $regex: filters.email, $options: "i" };
        }

        // Apply date range filters
        if (filters.createdAfter || filters.createdBefore) {
          query.createdAt = {};
          if (filters.createdAfter) {
            query.createdAt.$gte = filters.createdAfter;
          }
          if (filters.createdBefore) {
            query.createdAt.$lte = filters.createdBefore;
          }
        }
      }

      const users = await User.find(query).select("-password");

      return {
        success: true,
        data: users,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to find users",
      };
    }
  }

  /**
   * Updates a user's information
   * @param id ID of the user to update
   * @param updateData Data to update
   * @returns ServiceResponse<IUser>
   * @throws Validation error if updating to existing username/email
   */
  async update(
    id: string | Types.ObjectId,
    updateData: UpdateUserDto
  ): Promise<ServiceResponse<IUser>> {
    try {
      // Check for duplicate username/email before update
      if (updateData.email || updateData.username) {
        const existingUser = await User.findOne({
          _id: { $ne: id },
          $or: [
            updateData.username ? { username: updateData.username } : {},
            updateData.email ? { email: updateData.email } : {},
          ],
        });

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
      ).select("-password");

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
      // Handle mongoose validation errors
      if (error instanceof Error && error.name === "ValidationError") {
        return {
          success: false,
          error: "Invalid update data provided",
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update user",
      };
    }
  }

  /**
   * Deletes a user
   * @param id ID of the user to delete
   * @returns ServiceResponse<void>
   */
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
      // Handle invalid ObjectId
      if (error instanceof Error && error.name === "CastError") {
        return {
          success: false,
          error: "Invalid user ID format",
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete user",
      };
    }
  }
}
