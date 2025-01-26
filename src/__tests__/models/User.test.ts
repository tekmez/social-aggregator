import mongoose from "mongoose";
import { User } from "../../models/User";
import connectDB from "../../config/database";

describe("User Model Test", () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it("should create & save user successfully", async () => {
    const validUser = new User({
      username: "testuser",
      email: "test@test.com",
      password: "password123",
    });
    const savedUser = await validUser.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe(validUser.username);
    expect(savedUser.email).toBe(validUser.email);
    expect(savedUser.createdAt).toBeDefined();
  });

  it("should fail to save user without required fields", async () => {
    const userWithoutRequiredField = new User({ username: "test" });
    let err;

    try {
      await userWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it("should not save password in JSON response", async () => {
    const user = new User({
      username: "testuser",
      email: "test@test.com",
      password: "password123",
    });
    await user.save();

    const userJSON = user.toJSON();
    expect(userJSON.password).toBeUndefined();
  });
});
