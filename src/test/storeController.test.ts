import _ from "lodash";
import request from "supertest";
import { deleteData, loadData } from "../data/utils";
import { IStoreDocument, Store } from "../models/Store";
import { IUserDocument, User } from "../models/User";
import { app } from "../server";
import { exampleUserWes, loginExistingUser, newUser } from "./util";

let allStores: IStoreDocument[];
let allUsers: IUserDocument[];

beforeAll(async () => {
    await app.connectToTheDatabase(); // takes about 2 seconds
});

beforeEach(async () => {
    await deleteData(); // takes about 0.5 seconds
    await loadData();
    allStores = await Store.find();
    allUsers = await User.find();
});

// test("get all stores", async () => {
//     await request(app.app)
//         .get("/stores")
//         .then(response => {
//             _.isEqual(response.body.stores, allStores);
//         });
// });
//
// test("get all stores", async () => {
//     await request(app.app)
//         .get("/")
//         .then(response => {
//             _.isEqual(response.body.stores, allStores);
//         });
// });
//
// test("get all stores page out of bounds", async () => {
//     await request(app.app)
//         .get("/stores/page/100")
//         .expect(302); // redirect
// });
//
// test("get top stores", async () => {
//     await request(app.app)
//         .get("/top")
//         .then(response => {
//             expect(response.body.stores.length).toBeLessThan(allStores.length);
//             expect(
//                 response.body.stores.every((store: any) => store.averageRating)
//             ).toBe(true); // check ratings field added
//         });
// });
//
// test("heart a store endpoint adds the store id to the user's list of hearted stores", async () => {
//     const storeIDNotHeartedYet = "58c061518060197ca0b52d5e";
//     const loggedInUser = await loginExistingUser();
//     await loggedInUser
//         .post(`/api/stores/${storeIDNotHeartedYet}/heart`)
//         .then(response => {
//             expect(
//                 response.body.user.hearts.includes(storeIDNotHeartedYet)
//             ).toBe(true);
//         });
// });
//
// test("heart a store only works when logged in", async () => {
//     const storeIDNotHeartedYet = "58c061518060197ca0b52d5e";
//     await request
//         .agent(app.app)
//         .post(`/api/stores/${storeIDNotHeartedYet}/heart`)
//         .expect(401);
// });
//
// test("get hearted stores associated with a user", async () => {
//     const loggedInUser = await loginExistingUser();
//     await loggedInUser.post(`/hearts`).then(response => {
//         const storeIDs = response.body.stores.map((store: any) => store._id);
//         expect(_.isEqual(exampleUserWes!.hearts, storeIDs));
//     });
// });
//
// test("get stores near a lat/long location", async () => {
//     await request
//         .agent(app.app)
//         .get("/api/stores/near")
//         .query({
//             lat: "43.2557206",
//             lng: "-79.87110239999998"
//         })
//         .expect(200);
// });

test("search stores with a query string", async () => {
    await request
        .agent(app.app)
        .get("/api/search")
        .query({
            q: "coffee",
        })
        .expect(200);
});

test("get stores by tag", async () => {
    await request
        .agent(app.app)
        .get("/tags/Family%20Friendly")
        .then(response => {
            expect(
                response.body.stores.length
            ).toBeGreaterThan(0);
            expect(
                response.body.tags.length
            ).toBeLessThanOrEqual(allStores.length);
        });
});

test("get tags", async () => {
    await request
        .agent(app.app)
        .get("/tags")
        .then(response => {
            expect(
                response.body.stores.length
            ).toBe(allStores.length);
            expect(
                response.body.tags.length
            ).toBeGreaterThan(0);
        });
});

test("get store by slug and the associated reviews", async () => {
    await request
        .agent(app.app)
        .get("/store/rust-city-brewery")
        .then(response => {
            expect(
                response.body.store.author
            ).not.toBe(undefined);
            expect(
                response.body.store.reviews
            ).not.toBe(undefined);
        });
});

test("get store by incorrect slug and the associated reviews returns empty array", async () => {
    await request
        .agent(app.app)
        .get("/store/wontbefound")
        .expect({
            store: []
        })
});
