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
        .expect("Content-Type", /json/)
        .expect("Content-Length", "15")
        .expect(200)
        .end((err, res) => {
            if (err) {
                throw err;
            }
        });
});

test("example2", () => {
    class App {
        public app: express.Application;

        constructor() {
            this.app = express();

            this.app.get("/user", (req, res) => {
                res.status(200).json({ name: "john" });
            });
        }
    }

    const appNotImported = new App();
    request(appNotImported.app)
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

test.skip("example3", () => {
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

test("example4", () => {
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
