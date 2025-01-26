import mongoose from "mongoose";
import { SocialAccountService } from "../../services/SocialAccountService";
import { UserService } from "../../services/UserService";
import { SocialAccount } from "../../models/SocialAccount";
import { User } from "../../models/User";
import connectDB from "../../config/database";
import { CreateSocialAccountDto } from "../../types/services";
import { IUser } from "../../types/models";
import { Types } from "mongoose";

describe("SocialAccountService", () => {
  let socialAccountService: SocialAccountService;
  let userService: UserService;
  let userId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    await connectDB();
    socialAccountService = new SocialAccountService();
    userService = new UserService();

    // Test kullanıcısı oluştur
    const user = new User({
      username: "socialaccounttest",
      email: "socialaccounttest@test.com",
      password: "password123",
    });
    await user.save();
    userId = user._id;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Bağlantının tamamen kapanması için bekle
  });

  beforeEach(async () => {
    await SocialAccount.deleteMany({});
    await User.deleteMany({});
  });

  afterEach(async () => {
    await SocialAccount.deleteMany({});
    await User.deleteMany({});
  });

  describe("create", () => {
    it("should create a new social account successfully", async () => {
      const accountData: CreateSocialAccountDto = {
        platform: "twitter",
        accountId: "123456",
        username: "testaccount",
        userId: userId,
      };

      const result = await socialAccountService.create(accountData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.platform).toBe(accountData.platform);
      expect(result.data?.accountId).toBe(accountData.accountId);
      expect(result.data?.username).toBe(accountData.username);
    });

    it("should not create duplicate social account", async () => {
      const accountData: CreateSocialAccountDto = {
        platform: "twitter",
        accountId: "123456",
        username: "testaccount",
        userId: userId,
      };

      await socialAccountService.create(accountData);
      const result = await socialAccountService.create(accountData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Social media account already exists");
    });
  });

  describe("findByUserId", () => {
    it("should find all social accounts for a user", async () => {
      const accountData1: CreateSocialAccountDto = {
        platform: "twitter",
        accountId: "123456",
        username: "testaccount1",
        userId: userId,
      };

      const accountData2: CreateSocialAccountDto = {
        platform: "instagram",
        accountId: "789012",
        username: "testaccount2",
        userId: userId,
      };

      await socialAccountService.create(accountData1);
      await socialAccountService.create(accountData2);

      const result = await socialAccountService.findByUserId(userId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.map((acc) => acc.platform)).toContain("twitter");
      expect(result.data?.map((acc) => acc.platform)).toContain("instagram");
    });
  });

  describe("update", () => {
    it("should update social account successfully", async () => {
      const accountData: CreateSocialAccountDto = {
        platform: "twitter",
        accountId: "123456",
        username: "testaccount",
        userId: userId,
      };

      const createResult = await socialAccountService.create(accountData);
      const accountId = createResult.data?._id;

      const result = await socialAccountService.update(accountId!, {
        username: "newusername",
      });

      expect(result.success).toBe(true);
      expect(result.data?.username).toBe("newusername");
    });
  });

  describe("updateLastFetched", () => {
    it("should update lastFetched time", async () => {
      const accountData: CreateSocialAccountDto = {
        platform: "twitter",
        accountId: "123456",
        username: "testaccount",
        userId: userId,
      };

      const createResult = await socialAccountService.create(accountData);
      const accountId = createResult.data?._id;

      const result = await socialAccountService.updateLastFetched(accountId!);

      expect(result.success).toBe(true);
      expect(result.data?.lastFetched).toBeDefined();
    });
  });

  describe("delete", () => {
    it("should delete social account successfully", async () => {
      const accountData: CreateSocialAccountDto = {
        platform: "twitter",
        accountId: "123456",
        username: "testaccount",
        userId: userId,
      };

      const createResult = await socialAccountService.create(accountData);
      const accountId = createResult.data?._id;

      const result = await socialAccountService.delete(accountId!);

      expect(result.success).toBe(true);

      const findResult = await socialAccountService.findById(accountId!);
      expect(findResult.success).toBe(false);
    });
  });
});
