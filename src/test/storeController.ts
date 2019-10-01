import _ from "lodash";
import request from "supertest";
import { deleteData, loadData } from "../data/utils";
import { app } from "../server";
import { login, newUser, register } from "./util";

beforeAll(async () => {
    await app.connectToTheDatabase(); // takes about 2 seconds
});

beforeEach(async () => {
    await deleteData(); // takes about 0.5 seconds
    await loadData(); //
    // login wes
    await request(app.app)
        .post("/login")
        .type("form")
        .send({
            email: "wes@example.com",
            password: "wes"
        })
        .then(response => {
            expect(response.body.user.email).toBe("wes@example.com");
        });
});

test("get all stores", async () => {
    await request(app.app)
        .get("/stores")
        .then(response => {
            expect(response.body.stores.length).toBeGreaterThan(0);
        });
});

test("get all stores", async () => {
    await request(app.app)
        .get("/")
        .then(response => {
            expect(response.body.stores.length).toBeGreaterThan(0);
        });
});

test("get all stores page out of bounds", async () => {
    await request(app.app)
        .get("/stores/page/100")
        .expect(302); // redirect
});

test("get top stores", async () => {
    let stores;
    await request(app.app)
        .get("/stores")
        .then(response => {
            stores = response.body.stores;
            expect(response.body.stores.length).toBeGreaterThan(0);
        });

    await request(app.app)
        .get("/top")
        .then(response => {
            expect(response.body.stores.length).toBeLessThan(stores.length);
            expect(
                response.body.stores.every((store: any) => store.averageRating)
            ).toBe(true); // check ratings field added
        });
});

test("heart a store", async () => {
    let stores: any;
    await request(app.app)
        .get("/stores")
        .then(response => {
            stores = response.body.stores;
            expect(response.body.stores.length).toBeGreaterThan(0);
        });
    await request(app.app)
        .post(`/api/stores/${stores![0]._id}/heart`)
        .expect({
            user: ""
        });
});
