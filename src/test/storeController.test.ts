import _ from "lodash";
import request from "supertest";
import { deleteData, loadData } from "../data/utils";
import { Store } from "../models/Store";
import { app } from "../server";
import { exampleUserWes, loginExistingUser, newUser } from "./util";

let allStores: any;

beforeAll(async () => {
    await app.connectToTheDatabase(); // takes about 2 seconds
});

beforeEach(async () => {
    await deleteData(); // takes about 0.5 seconds
    await loadData();
    allStores = await Store.find();
});

test("get all stores", async () => {
    await request(app.app)
        .get("/stores")
        .then(response => {
            _.isEqual(response.body.stores, allStores);
        });
});

test("get all stores", async () => {
    await request(app.app)
        .get("/")
        .then(response => {
            _.isEqual(response.body.stores, allStores);
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
            expect(response.body.stores.length).toBeLessThan(allStores.length);
            expect(
                response.body.stores.every((store: any) => store.averageRating)
            ).toBe(true); // check ratings field added
        });
});

test("heart a store endpoint adds the store id to the user's list of hearted stores", async () => {
    const loggedInUser = await loginExistingUser();
    await loggedInUser
        .post(`/api/stores/${allStores![0]._id}/heart`)
        .then((response: any) => {
            expect(
                response.body.user.hearts.includes(allStores![0]._id.toString())
            ).toBe(true);
        });
});

test("heart a store only works when logged in", async () => {
    await request
        .agent(app.app)
        .post(`/api/stores/${allStores![0]._id}/heart`)
        .expect(401);
});

test("get hearted stores associated with a user", async () => {
    const loggedInUser = await loginExistingUser();
    await loggedInUser.post(`/hearts`).then((response: any) => {
        const storeIDs = response.body.stores.map((store: any) => store._id);
        expect(_.isEqual(exampleUserWes.hearts, storeIDs));
    });
});

test("get stores near a lat/long location", async () => {
    await request
        .agent(app.app)
        .post("/api/stores/near")
        .send({
            lat: "100",
            lng: "0"
        })
        .expect(200);
});
