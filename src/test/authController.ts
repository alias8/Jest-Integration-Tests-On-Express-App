import request from "supertest";
import { deleteData, loadData } from "../data/utils";
import { User } from "../models/User";
import { app } from "../server";
import {
    exampleUserWes,
    login,
    loginExistingUser,
    logout,
    newUser,
    register
} from "./util";

beforeAll(async () => {
    await app.connectToTheDatabase(); // takes about 2 seconds
});

beforeEach(async () => {
    await deleteData(); // takes about 0.5 seconds
    await loadData();
});

async function sendResetEmail() {
    const loggedInUser = await loginExistingUser();
    let user = await User.findOne({ email: exampleUserWes!.email });
    expect(user!.resetPasswordToken).toBe(undefined);
    await loggedInUser
        .post("/account/forgot")
        .send({
            email: user!.email
        })
        .then(response => {
            expect(response.body.message).toBe(
                `A password reset email has been sent to ${user!.email}`
            );
        });
    user = await User.findOne({ email: exampleUserWes!.email });
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
    user!.resetPasswordExpires = Date.now() - 1000 * 60;
    await user!.save();
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
