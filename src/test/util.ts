import request from "supertest";
import { IUserModel } from "../models/User";
import { app } from "../server";

export const newUser = {
    email: "jameskirk8@gmail.com",
    name: "testuser",
    password: "password123",
    "password-confirm": "password123"
};

export async function register(): Promise<IUserModel> {
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

export async function login(): Promise<IUserModel> {
    return await request(app.app)
        .post("/login")
        .type("form")
        .send({
            email: newUser.email,
            password: newUser.password
        })
        .then(response => {
            expect(response.body.user.email).toBe(newUser.email);
            expect(response.body.authenticated).toBe(true);
            return response.body;
        });
}

export async function logout() {
    await request(app.app)
        .get("/logout")
        .expect({
            loggedIn: false
        });
}
