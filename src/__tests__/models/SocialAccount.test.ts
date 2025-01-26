import mongoose from "mongoose";
import { SocialAccount } from "../../models/SocialAccount";
import { User } from "../../models/User";
import connectDB from "../../config/database";
import { IUser } from "../../types/models";

describe("SocialAccount Model Test", () => {
  let userId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    await connectDB();
    // Test için kullanıcı oluştur
    const user = new User({
      username: "socialaccountmodeltest",
      email: "socialaccountmodel@test.com",
      password: "password123",
    });
    await user.save();
    userId = user._id;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await SocialAccount.deleteMany({});
  });

  it("should create & save social account successfully", async () => {
    const validAccount = new SocialAccount({
      platform: "twitter",
      accountId: "123456",
      username: "testaccount",
      userId: userId,
      lastFetched: new Date(),
    });
    const savedAccount = await validAccount.save();

    expect(savedAccount._id).toBeDefined();
    expect(savedAccount.platform).toBe(validAccount.platform);
    expect(savedAccount.accountId).toBe(validAccount.accountId);
    expect(savedAccount.username).toBe(validAccount.username);
  });

  it("should fail to save account with invalid platform", async () => {
    const accountWithInvalidPlatform = new SocialAccount({
      platform: "invalid",
      accountId: "123456",
      username: "testaccount",
      userId: userId,
    });

    let err: any;
    try {
      await accountWithInvalidPlatform.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.platform).toBeDefined();
  });

  it("should fail to save duplicate account for same user and platform", async () => {
    const accountData = {
      platform: "twitter" as const,
      accountId: "123456",
      username: "testaccount",
      userId: userId,
    };

    await SocialAccount.create(accountData);

    let err: any = null;
    try {
      await SocialAccount.create(accountData);
    } catch (error) {
      err = error;
    }

    expect(err).not.toBeNull();
    expect(err.code).toBe(11000);
  });
});
