import mongoose from "mongoose";
import connectDB from "../config/database";

describe("Database Connection", () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should connect to MongoDB", () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  it("should use the test database", () => {
    expect(mongoose.connection.name).toBe("social-aggregator");
  });
});
