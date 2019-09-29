import request from "supertest";
import { deleteData } from "../data/utils";
import { app } from "../server";

beforeAll(async () => {
  await app.connectToTheDatabase(); // takes about 2 seconds
});

beforeEach(async () => {
  await deleteData(); // takes about 0.5 seconds
});

test("test going to account page", async () => {
  const newUser = {
    email: "newuseremail@gmail.com",
    name: "testuser",
    password: "password123",
    "password-confirm": "password123"
  };
  await request(app.app)
    .post("/register")
    .send({
      ...newUser
    })
    .expect(302) // redirect
    .expect('Location', /\/$/);

  await request(app.app)
    .post("/login")
    .send({
      email: "newuseremail@gmail.com",
      password: "password123",
    })
    .expect(302) // redirect
    .expect('Location', /\/$/);
});
