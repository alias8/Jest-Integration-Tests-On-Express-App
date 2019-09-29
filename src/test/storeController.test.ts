import request from "supertest";
import { deleteData } from "../data/utils";
import { app } from "../server";

beforeAll(async () => {
  await app.connectToTheDatabase(); // takes about 2 seconds
});

beforeEach(async () => {
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
    .expect(302)
});

