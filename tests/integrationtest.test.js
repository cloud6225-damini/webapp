const request = require("supertest");
const app = require("../app/server");
const { createDatabase,sequelize } = require("../app/databaseConfig/databaseConnect");

beforeAll(async () => {
  await createDatabase(); 
});

afterAll(async () => {
  await sequelize.close(); 
});

describe("Integration Tests for User API", () => {
  test("Create an account and validate using GET", async () => {
    const reqBody = {
      first_name: "Damini",
      last_name: "Th",
      email: "sgjnsg@gmail.com",
      password: "Damini@123456",
    };

    const postUserResponse = await request(app).post("/v1/user").send(reqBody);
    console.log("postUserResponse",postUserResponse);
    expect(postUserResponse.statusCode).toBe(201); 

    const base64Token = Buffer.from(`${reqBody.email}:${reqBody.password}`).toString("base64");
    const getUserResponse = await request(app)
      .get("/v1/user/self")
      .set("Authorization", `Basic ${base64Token}`);
    expect(getUserResponse.statusCode).toBe(200); 
    expect(getUserResponse.body.email).toBe(reqBody.email); 
  });

  test("Update an account and validate using GET", async () => {
    const reqBody = {
      first_name: "ABC",
      last_name: "XYZ",
      password: "Th@123",
    };

    const authToken = {
      email: "sgjnsg@gmail.com",
      password: "Damini@123456",
    };

    const base64TokenforPut = Buffer.from(`${authToken.email}:${authToken.password}`).toString("base64");

    const putUserResponse = await request(app)
      .put("/v1/user/self")
      .send(reqBody)
      .set("Authorization", `Basic ${base64TokenforPut}`);
    expect(putUserResponse.statusCode).toBe(204); 

    const base64Token = Buffer.from(`${authToken.email}:${reqBody.password}`).toString("base64");
    const getUserResponse = await request(app)
      .get("/v1/user/self")
      .set("Authorization", `Basic ${base64Token}`);
    expect(getUserResponse.statusCode).toBe(200); 
    expect(getUserResponse.body.email).toBe(authToken.email); 
    expect(getUserResponse.body.first_name).toBe(reqBody.first_name);
    expect(getUserResponse.body.last_name).toBe(reqBody.last_name);
  });
});

