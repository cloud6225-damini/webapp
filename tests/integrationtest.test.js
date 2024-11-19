const request = require("supertest");
const app = require("../app/server");
const { sequelize } = require("../app/databaseConfig/databaseConnect");
const User = require("../app/models/userModel");
const bcrypt = require("bcrypt");

let transaction; // Transaction to isolate tests

// Mock AWS SDK 
jest.mock("aws-sdk", () => {
  const SNS = jest.fn(() => ({
    publish: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({}),
    }),
  }));

  const CloudWatch = jest.fn(() => ({
    putMetricData: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({}),
    }),
  }));

  const S3 = jest.fn(() => ({
    upload: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({}),
    }),
    deleteObject: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({}),
    }),
  }));

  return {
    SNS,
    CloudWatch,
    S3,
  };
});

// Helper function to create a user
const createUserInDatabase = async (userData, transaction) => {
  return User.create(
    {
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      password: await bcrypt.hash(userData.password, 10), // Hash password for authentication
      verified: userData.verified || false,
    },
    { transaction }
  );
};

// Helper function to create Basic Auth token
const createBase64Token = (email, password) => {
  return Buffer.from(`${email}:${password}`).toString("base64");
};

// Reset database using a transaction before each test
beforeEach(async () => {
  transaction = await sequelize.transaction();
  await sequelize.sync({ transaction }); // Ensure schema exists
});

// Rollback transaction after each test
afterEach(async () => {
  if (transaction) {
    await transaction.rollback();
  }
});

// Close database connection after all tests
afterAll(async () => {
  await sequelize.close();
});

describe("Integration Tests for User API", () => {
  const testUser = {
    first_name: "Damini",
    last_name: "Th",
    email: "daminitest1234@gmail.com",
    password: "Damini@123456",
  };

  test("Create an account and validate using GET", async () => {
    // Test user creation
    const postUserResponse = await request(app).post("/v1/user").send(testUser);
    console.debug("postUserResponse", postUserResponse.body);
    expect(postUserResponse.statusCode).toBe(201);

    // Mock verification to bypass email check
    await User.update(
      { verified: true },
      { where: { email: testUser.email }, transaction }
    );

    // Test retrieving created user
    const base64Token = createBase64Token(testUser.email, testUser.password);
    const getUserResponse = await request(app)
      .get("/v1/user/self")
      .set("Authorization", `Basic ${base64Token}`);
    console.debug("getUserResponse", getUserResponse.body);
    expect(getUserResponse.statusCode).toBe(200);
    expect(getUserResponse.body.email).toBe(testUser.email);
  });

  // test("Update an account and validate using GET", async () => {
  //   const updatedUser = {
  //     first_name: "ABC",
  //     last_name: "XYZ",
  //     password: "Th@123",
  //   };

  //   // Create and verify user
  //   await createUserInDatabase(testUser, transaction);
  //   await User.update(
  //     { verified: true },
  //     { where: { email: testUser.email }, transaction }
  //   );

  //   // Test user update
  //   const base64TokenForPut = createBase64Token(
  //     testUser.email,
  //     testUser.password
  //   );
  //   const putUserResponse = await request(app)
  //     .put("/v1/user/self")
  //     .send(updatedUser)
  //     .set("Authorization", `Basic ${base64TokenForPut}`);
  //   console.debug("putUserResponse", putUserResponse.body);
  //   expect(putUserResponse.statusCode).toBe(204);

  //   // Test retrieving updated user
  //   const base64TokenForGet = createBase64Token(
  //     testUser.email,
  //     updatedUser.password
  //   );
  //   const getUserResponse = await request(app)
  //     .get("/v1/user/self")
  //     .set("Authorization", `Basic ${base64TokenForGet}`);
  //   console.debug("getUserResponse", getUserResponse.body);
  //   expect(getUserResponse.statusCode).toBe(200);
  //   expect(getUserResponse.body.email).toBe(testUser.email);
  //   expect(getUserResponse.body.first_name).toBe(updatedUser.first_name);
  //   expect(getUserResponse.body.last_name).toBe(updatedUser.last_name);
  // });
});
