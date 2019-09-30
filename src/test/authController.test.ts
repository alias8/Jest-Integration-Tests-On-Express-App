import request from "supertest";
import { deleteData } from "../data/utils";
import { User } from "../models/User";
import { app } from "../server";

const newUser = {
    email: "newuseremail@gmail.com",
    name: "testuser",
    password: "password123",
    "password-confirm": "password123"
};

beforeAll(async () => {
    await app.connectToTheDatabase(); // takes about 2 seconds
});

beforeEach(async () => {
    await deleteData(); // takes about 0.5 seconds
});

async function register() {
    await request(app.app)
        .post("/register")
        .send({
            ...newUser
        })
        .expect(302) // redirect
        .expect("Location", /\/$/);
}

async function login() {
    await register();
    await request(app.app)
        .post("/login")
        .type("form")
        .send({
            email: newUser.email,
            password: newUser.password
        })
        .expect(302) // redirect
        .expect("Location", /\/$/);
}

async function logout() {
    await request(app.app)
        .get("/logout")
        .expect(302) // redirect
        .expect("Location", /\/$/);
}

test("test login", async () => {
    await login();
});

test("test logout", async () => {
    await logout();
});

test("test forgot", async () => {
    await register();
    const userBefore = await User.findOne({ email: newUser.email });
    expect(userBefore!.resetPasswordToken).toBe(undefined);
    await request(app.app)
        .post("/account/forgot")
        .send({
            email: newUser.email
        })
        .expect(302) // redirect
        .expect("Location", /\/login$/);
    const userAfter = await User.findOne({ email: newUser.email });
    expect(userAfter!.resetPasswordToken).not.toBe(undefined);
});
