import request from "supertest";
import { app } from "../server";
import { deleteData } from "../data/utils";

beforeEach(async () => {
  await app.connectToTheDatabase(); // takes about 2 seconds
  await deleteData(); // takes about 0.5 seconds
});

test("get all stores", async () => {
  await request(app.app)
    .get("/stores")
    .expect("Content-Type", /json/)
    .expect(200)
});

test("get all stores page out of bounds", async () => {
  await request(app.app)
    .get("/stores/page/100")
    .expect(404)
});
