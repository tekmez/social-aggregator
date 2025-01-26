import mongoose from "mongoose";
import { UserService } from "../../services/UserService";
import { User } from "../../models/User";
import connectDB from "../../config/database";
import { CreateUserDto, UpdateUserDto } from "../../types/services";

describe("UserService", () => {
  let userService: UserService;

  beforeAll(async () => {
    await connectDB();
    userService = new UserService();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("create", () => {
    it("should create a new user successfully", async () => {
      const userData: CreateUserDto = {
        username: "testuser",
        email: "test@test.com",
        password: "password123",
      };

      const result = await userService.create(userData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.username).toBe(userData.username);
      expect(result.data?.email).toBe(userData.email);
    });

    it("should not create user with duplicate username", async () => {
      const userData: CreateUserDto = {
        username: "testuser",
        email: "test@test.com",
        password: "password123",
      };

      await userService.create(userData);
      const result = await userService.create({
        ...userData,
        email: "different@test.com",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Username or email already exists");
    });
  });

  describe("findById", () => {
    it("should find user by id", async () => {
      const userData: CreateUserDto = {
        username: "testuser",
        email: "test@test.com",
        password: "password123",
      };

      const createResult = await userService.create(userData);
      const userId = createResult.data?._id;

      const result = await userService.findById(userId!);

      expect(result.success).toBe(true);
      expect(result.data?.username).toBe(userData.username);
    });

    it("should return error for non-existent user", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const result = await userService.findById(fakeId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("User not found");
    });
  });

  describe("update", () => {
    it("should update user successfully", async () => {
      const userData: CreateUserDto = {
        username: "testuser",
        email: "test@test.com",
        password: "password123",
      };

      const createResult = await userService.create(userData);
      const userId = createResult.data?._id;

      const updateData: UpdateUserDto = {
        username: "newusername",
      };

      const result = await userService.update(userId!, updateData);

      expect(result.success).toBe(true);
      expect(result.data?.username).toBe(updateData.username);
    });

    it("should not update to existing username", async () => {
      // Create first user
      await userService.create({
        username: "user1",
        email: "user1@test.com",
        password: "password123",
      });

      // Create second user
      const secondUser = await userService.create({
        username: "user2",
        email: "user2@test.com",
        password: "password123",
      });

      // Try to update second user with first user's username
      const result = await userService.update(secondUser.data?._id!, {
        username: "user1",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Username or email already exists");
    });
  });

  describe("delete", () => {
    it("should delete user successfully", async () => {
      const userData: CreateUserDto = {
        username: "testuser",
        email: "test@test.com",
        password: "password123",
      };

      const createResult = await userService.create(userData);
      const userId = createResult.data?._id;

      const result = await userService.delete(userId!);

      expect(result.success).toBe(true);

      const findResult = await userService.findById(userId!);
      expect(findResult.success).toBe(false);
    });

    it("should return error for non-existent user", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const result = await userService.delete(fakeId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("User not found");
    });
  });
});
