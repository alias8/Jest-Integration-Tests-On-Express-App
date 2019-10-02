import _ from "lodash";
import request from "supertest";
import { deleteData, loadData } from "../data/utils";
import { Store } from "../models/Store";
import { app } from "../server";

let stores: any;

beforeAll(async () => {
    await app.connectToTheDatabase(); // takes about 2 seconds
});

beforeEach(async () => {
    await deleteData(); // takes about 0.5 seconds
    await loadData(); //
    stores = await Store.find();
});

test("get all stores", async () => {
    await request(app.app)
        .get("/stores")
        .then(response => {
            _.isEqual(response.body.stores, stores);
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
    const newUser = {
        email: "newuseremail@gmail.com",
        name: "testuser",
        password: "password123",
        "password-confirm": "password123"
    };
    const loggedInUser = request.agent(app.app);
    await loggedInUser
        .post("/register")
        .send({
            ...newUser
        })
        .expect(200)
        .then((response: any) => {
            expect(response.body.user.email).toBe(newUser.email);
        });

    await loggedInUser
        .post(`/api/stores/${stores![0]._id}/heart`)
        .then((response: any) => {
            expect(response.body.user.email).toBe(newUser.email);
            expect(
                response.body.user.hearts.includes(stores![0]._id.toString())
            ).toBe(true);
        });
});

test("heart a store only works when logged in", async () => {
    await request
        .agent(app.app)
        .post(`/api/stores/${stores![0]._id}/heart`)
        .expect(401);
});
