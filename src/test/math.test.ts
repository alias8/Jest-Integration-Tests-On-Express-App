import request from "supertest";
import { app } from "../server";
import yargs from "yargs";

test("example3", () => {
  console.log(`config environment: ${yargs.argv.configEnvironment}`);
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
