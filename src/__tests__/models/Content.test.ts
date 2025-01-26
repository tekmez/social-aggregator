import mongoose from "mongoose";
import { Content } from "../../models/Content";
import { SocialAccount } from "../../models/SocialAccount";
import { User } from "../../models/User";
import connectDB from "../../config/database";
import { IUser, ISocialAccount } from "../../types/models";

describe("Content Model Test", () => {
  let socialAccountId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await SocialAccount.deleteMany({});
    await Content.deleteMany({});

    // Test için kullanıcı ve sosyal medya hesabı oluştur
    const user = await User.create({
      username: "contentmodeltest",
      email: "contentmodel@test.com",
      password: "password123",
    });

    const account = (await SocialAccount.create({
      platform: "twitter",
      accountId: "123456",
      username: "testaccount",
      userId: user._id,
    })) as ISocialAccount;

    socialAccountId = account._id;
  });

  afterEach(async () => {
    await Content.deleteMany({});
  });

  it("should create & save content successfully", async () => {
    const validContent = new Content({
      type: "text",
      originalContent: "Test content",
      socialAccountId: socialAccountId,
      platform: "twitter",
      postedAt: new Date(),
    });

    const savedContent = await validContent.save();

    expect(savedContent._id).toBeDefined();
    expect(savedContent.type).toBe(validContent.type);
    expect(savedContent.originalContent).toBe(validContent.originalContent);
    expect(savedContent.platform).toBe(validContent.platform);
  });

  it("should fail to save content with invalid type", async () => {
    const contentWithInvalidType = new Content({
      type: "invalid",
      originalContent: "Test content",
      socialAccountId: socialAccountId,
      platform: "twitter",
      postedAt: new Date(),
    });

    let err: any;
    try {
      await contentWithInvalidType.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.type).toBeDefined();
  });

  it("should save content with processed content", async () => {
    const contentWithProcessed = new Content({
      type: "text" as const,
      originalContent: "Test content",
      processedContent: "Processed test content",
      socialAccountId: socialAccountId,
      platform: "twitter" as const,
      postedAt: new Date(),
    });

    const savedContent = await contentWithProcessed.save();

    expect(savedContent.processedContent).toBe(
      contentWithProcessed.processedContent
    );
  });
});
