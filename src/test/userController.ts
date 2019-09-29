import request from "supertest";
import { deleteData } from "../data/utils";
import { app } from "../server";

beforeAll(async () => {
  await app.connectToTheDatabase(); // takes about 2 seconds
});

beforeEach(async () => {
  await deleteData(); // takes about 0.5 seconds
});

test("registering with password mismatch returns error", async () => {
  const newUser = {
    email: "newuseremail@email.com",
    name: "testuser",
    password: "password123",
    "password-confirm": "password1234"
  };
  await request(app.app)
    .post("/register")
    .send({
      ...newUser
    })
    .expect(400)
    .expect({
      body : {
        ...newUser,
      },
      errors: ["Oops! Your passwords do not match"]
    });
});
test("registering with empty password returns error", async () => {
  const newUser = {
    email: "newuseremail@email.com",
    name: "testuser",
    password: "",
    "password-confirm": ""
  };
  await request(app.app)
    .post("/register")
    .send({
      ...newUser
    })
    .expect(400)
    .expect({
      body : {
        ...newUser,
      },
      errors: ["Password Cannot be Blank!", "Confirmed Password cannot be blank!"]
    });
});

test("registering with no name returns error", async () => {
  const newUser = {
    email: "newuseremail@email.com",
    name: "",
    password: "password123",
    "password-confirm": "password123"
  };
  await request(app.app)
    .post("/register")
    .send({
      ...newUser
    })
    .expect(400)
    .expect({
      body : {
        ...newUser,
      },
      errors: ["You must supply a name!"]
    });
});

test("registering with invalid email returns error", async () => {
  const newUser = {
    email: "newuseremail@",
    name: "testuser",
    password: "password123",
    "password-confirm": "password123"
  };
  await request(app.app)
    .post("/register")
    .send({
      ...newUser
    })
    .expect(400)
    .expect({
      body : {
        ...newUser,
      },
      errors: ["That Email is not valid!"]
    });
});

test("test good registration", async () => {
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
});
