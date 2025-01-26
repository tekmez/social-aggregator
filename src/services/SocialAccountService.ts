import { Types } from "mongoose";
import { SocialAccount } from "../models/SocialAccount";
import { ISocialAccount } from "../types/models";
import {
  CreateSocialAccountDto,
  UpdateSocialAccountDto,
  SocialAccountFilters,
  ServiceResponse,
} from "../types/services";

export class SocialAccountService {
  /**
   * Creates a new social media account
   * @param accountData Account data to be created
   * @returns ServiceResponse<ISocialAccount>
   * @throws Validation error if account already exists for user
   */
  async create(
    accountData: CreateSocialAccountDto
  ): Promise<ServiceResponse<ISocialAccount>> {
    try {
      // Check for existing account with same platform and accountId for user
      const existingAccount = await SocialAccount.findOne({
        userId: accountData.userId,
        platform: accountData.platform,
        accountId: accountData.accountId,
      });

      if (existingAccount) {
        return {
          success: false,
          error: "Social media account already exists",
        };
      }

      // Create and save new account
      const account = new SocialAccount(accountData);
      await account.save();

      return {
        success: true,
        data: account,
      };
    } catch (error) {
      // Handle mongoose validation errors
      if (error instanceof Error && error.name === "ValidationError") {
        return {
          success: false,
          error: "Invalid social media account data provided",
        };
      }

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create social media account",
      };
    }
  }

  /**
   * Finds a social media account by its ID
   * @param id ID of the social media account
   * @returns ServiceResponse<ISocialAccount>
   */
  async findById(
    id: string | Types.ObjectId
  ): Promise<ServiceResponse<ISocialAccount>> {
    try {
      const account = await SocialAccount.findById(id);

      if (!account) {
        return {
          success: false,
          error: "Social media account not found",
        };
      }

      return {
        success: true,
        data: account,
      };
    } catch (error) {
      // Handle invalid ObjectId
      if (error instanceof Error && error.name === "CastError") {
        return {
          success: false,
          error: "Invalid account ID format",
        };
      }

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to find social media account",
      };
    }
  }

  /**
   * Finds all social media accounts for a specific user
   * @param userId User ID to search for
   * @returns ServiceResponse<ISocialAccount[]>
   */
  async findByUserId(
    userId: string | Types.ObjectId
  ): Promise<ServiceResponse<ISocialAccount[]>> {
    try {
      // Handle invalid ObjectId before query
      if (!Types.ObjectId.isValid(userId)) {
        return {
          success: false,
          error: "Invalid user ID format",
        };
      }

      const accounts = await SocialAccount.find({ userId });

      return {
        success: true,
        data: accounts,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to find social media accounts",
      };
    }
  }

  /**
   * Finds social media accounts based on filters
   * @param filters Optional filters for platform, username, userId, and lastFetched
   * @returns ServiceResponse<ISocialAccount[]>
   */
  async findAll(
    filters?: SocialAccountFilters
  ): Promise<ServiceResponse<ISocialAccount[]>> {
    try {
      const query: any = {};

      if (filters) {
        // Apply platform filter
        if (filters.platform) {
          query.platform = filters.platform;
        }

        // Apply username filter with case-insensitive search
        if (filters.username) {
          query.username = { $regex: filters.username, $options: "i" };
        }

        // Apply userId filter
        if (filters.userId) {
          if (!Types.ObjectId.isValid(filters.userId)) {
            return {
              success: false,
              error: "Invalid user ID format in filters",
            };
          }
          query.userId = filters.userId;
        }

        // Apply lastFetched date range filters
        if (filters.lastFetchedBefore || filters.lastFetchedAfter) {
          query.lastFetched = {};
          if (filters.lastFetchedBefore) {
            query.lastFetched.$lte = filters.lastFetchedBefore;
          }
          if (filters.lastFetchedAfter) {
            query.lastFetched.$gte = filters.lastFetchedAfter;
          }
        }
      }

      const accounts = await SocialAccount.find(query);

      return {
        success: true,
        data: accounts,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to find social media accounts",
      };
    }
  }

  /**
   * Updates a social media account
   * @param id ID of the account to update
   * @param updateData Data to update
   * @returns ServiceResponse<ISocialAccount>
   */
  async update(
    id: string | Types.ObjectId,
    updateData: UpdateSocialAccountDto
  ): Promise<ServiceResponse<ISocialAccount>> {
    try {
      const account = await SocialAccount.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!account) {
        return {
          success: false,
          error: "Social media account not found",
        };
      }

      return {
        success: true,
        data: account,
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
        error:
          error instanceof Error
            ? error.message
            : "Failed to update social media account",
      };
    }
  }

  /**
   * Updates the last fetched time of a social media account
   * @param id ID of the account to update
   * @returns ServiceResponse<ISocialAccount>
   */
  async updateLastFetched(
    id: string | Types.ObjectId
  ): Promise<ServiceResponse<ISocialAccount>> {
    try {
      const account = await SocialAccount.findByIdAndUpdate(
        id,
        { $set: { lastFetched: new Date() } },
        { new: true }
      );

      if (!account) {
        return {
          success: false,
          error: "Social media account not found",
        };
      }

      return {
        success: true,
        data: account,
      };
    } catch (error) {
      // Handle invalid ObjectId
      if (error instanceof Error && error.name === "CastError") {
        return {
          success: false,
          error: "Invalid account ID format",
        };
      }

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update last fetch time",
      };
    }
  }

  /**
   * Deletes a social media account
   * @param id ID of the account to delete
   * @returns ServiceResponse<void>
   */
  async delete(id: string | Types.ObjectId): Promise<ServiceResponse<void>> {
    try {
      const account = await SocialAccount.findByIdAndDelete(id);

      if (!account) {
        return {
          success: false,
          error: "Social media account not found",
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
          error: "Invalid account ID format",
        };
      }

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete social media account",
      };
    }
  }
}
