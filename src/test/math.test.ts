import express from "express";
import request from "supertest";
import { app } from "../server";

test("example", () => {
    const appExample = express();

    appExample.get("/user", (req, res) => {
        res.status(200).json({ name: "john" });
    });
    request(appExample)
        .get("/user")
        .expect(200)
        .end((err, res) => {
            if (err) {
                throw err;
            }
        });
});

test("example3", () => {
    request(app.app)
        .get("/user")
        .expect("Content-Type", /json/)
        .expect("Content-Length", "15")
        .expect(200)
        .end((err, res) => {
            if (err) {
                throw err;
            }
        });
});
