import request from "supertest";
import { deleteData } from "../data/utils";
import { app } from "../server";

beforeAll(async () => {
  await app.connectToTheDatabase(); // takes about 2 seconds
});

beforeEach(async () => {
  await deleteData(); // takes about 0.5 seconds
});

test("registering new user works", async () => {
  const newUser = {
    email: "newuseremail@email.com",
    name: "testuser",
    password: "password123"
  };
  await request(app.app)
    .post("/register")
    .send({
      ...newUser
    })
    .expect(200)
});
