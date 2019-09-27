import dotenv from "dotenv";
import path from "path";
import request from "supertest";
import App from "../app";

// test("example", () => {
//     const appExample = express();
//
//     appExample.get("/user", (req, res) => {
//         res.status(200).json({ name: "john" });
//     });
//     request(appExample)
//         .get("/user")
//         .expect("Content-Type", /json/)
//         .expect("Content-Length", "15")
//         .expect(200)
//         .end((err, res) => {
//             if (err) {
//                 throw err;
//             }
//         });
// });
//
// test("example2", () => {
//     class App {
//         public app: express.Application;
//
//         constructor() {
//             this.app = express();
//
//             this.app.get("/user", (req, res) => {
//                 res.status(200).json({ name: "john" });
//             });
//         }
//     }
//
//     const appNotImported = new App();
//     request(appNotImported.app)
//         .get("/user")
//         .expect("Content-Type", /json/)
//         .expect("Content-Length", "15")
//         .expect(200)
//         .end((err, res) => {
//             if (err) {
//                 throw err;
//             }
//         });
// });
//
// test.skip("example3", () => {
//     request(app.app)
//         .get("/user")
//         .expect("Content-Type", /json/)
//         .expect("Content-Length", "15")
//         .expect(200)
//         .end((err, res) => {
//             if (err) {
//                 throw err;
//             }
//         });
// });
//
// test("example4", () => {
//     request(app.app)
//         .get("/user")
//         .expect("Content-Type", /json/)
//         .expect("Content-Length", "15")
//         .expect(200)
//         .end((err, res) => {
//             if (err) {
//                 throw err;
//             }
//         });
// });

let app: App;

beforeEach(() => {
    // will this work?
    jest.resetModules();
    dotenv.config({ path: path.resolve(__dirname, "config", "test", ".env") });
    app = require("../server");
    console.log(`environment in beforeEach: ${process.env.NODE_ENV}`);
});

test("example5", () => {
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
