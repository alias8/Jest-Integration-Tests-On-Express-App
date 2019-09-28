import request from "supertest";
import { app } from "../server";

test("get all stores", async () => {
  await request(app.app)
    .get("/stores")
    .expect("Content-Type", /json/)
    .expect(200)
});

test("get all stores page out of bounds", async () => {
  await request(app.app)
    .get("/stores/page/5")
    .expect(404)
});
