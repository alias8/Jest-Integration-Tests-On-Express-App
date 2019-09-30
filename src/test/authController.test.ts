import request from "supertest";
import { deleteData } from "../data/utils";
import { IUserModel, User } from "../models/User";
import { app } from "../server";

const newUser = {
    email: "jameskirk8@gmail.com",
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

async function register(): Promise<IUserModel> {
    return await request(app.app)
        .post("/register")
        .send({
            ...newUser
        })
        .then(response => {
            expect(response.body.user.email).toBe(newUser.email);
            return response.body.user;
        });
}

async function login(): Promise<IUserModel> {
    return await request(app.app)
        .post("/login")
        .type("form")
        .send({
            email: newUser.email,
            password: newUser.password
        })
        .then(response => {
            expect(response.body.user.email).toBe(newUser.email);
            return response.body.user;
        });
}

async function logout() {
    await request(app.app)
        .get("/logout")
        .expect({
            loggedIn: false
        });
}

async function sendResetEmail() {
    let user = await register();
    expect(user!.resetPasswordToken).toBe(undefined);
    await request(app.app)
        .post("/account/forgot")
        .send({
            email: newUser.email
        })
        .then(response => {
            expect(response.body.message).toBe(
                `A password reset email has been sent to ${newUser.email}`
            );
        });
    user = await login();
    expect(user!.resetPasswordToken).not.toBe(undefined);
    return user;
}

test("test register", async () => {
    await register();
});

test("test login", async () => {
    await register();
    await login();
});

test("test logout", async () => {
    await logout();
});

test("test forgot", async () => {
    await sendResetEmail();
});

test("test token reset with valid token", async () => {
    const user = await sendResetEmail();
    await request(app.app)
        .get(`/account/reset/${user!.resetPasswordToken}`)
        .expect({
            tokenValid: true
        });
});

test("test token reset with invalid token", async () => {
    const user = await sendResetEmail();
    const userInDatabase = await User.findOne({
        email: user.email
    });
    userInDatabase!.resetPasswordExpires = Date.now() - 1000 * 60;
    await userInDatabase!.save();
    await request(app.app)
        .get(`/account/reset/${user!.resetPasswordToken}`)
        .expect({
            error: "Password reset is invalid or has expired",
            tokenValid: false
        });
});

test("test change password", async () => {
    const user = await sendResetEmail();
    await request(app.app)
        .post(`/account/reset/${user!.resetPasswordToken}`)
        .send({
            password: "123",
            "password-confirm": "123"
        })
        .expect({
            message: "Your password has been reset! You are now logged in"
        });
});

test("test change password when passwords don't match", async () => {
    const user = await sendResetEmail();
    await request(app.app)
        .post(`/account/reset/${user!.resetPasswordToken}`)
        .send({
            password: "123",
            "password-confirm": "1234"
        })
        .expect({
            errors: ["Oops! Your passwords do not match"]
        });
});
