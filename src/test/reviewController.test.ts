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

test.only("posting a review adds that to the store's reviews", async () => {
    const storeIDToReview = "58c03a958060197ca0b52d50";
    const loggedInUser = await loginExistingUser();
    await loggedInUser
        .post(`/reviews/${storeIDToReview}`)
        .send({
            body: "new review 123"
        })
        .expect(302);

    await loggedInUser
        .get("/store/rust-city-brewery")
        .then(response => {
            expect(
                response.body.store.reviews
            ).toBe("");
        });
});

// test("posting a review requires being logged in", async () => {
//
// });

const aa = [{
    "__v": 0,
    "_id": "58c03ac18060197ca0b52d51",
    "author": {
        "__v": 0,
        "_id": "58c039018060197ca0b52d4c",
        "email": "wes@example.com",
        "hearts": ["58c039938060197ca0b52d4d", "58c03a428060197ca0b52d4f"],
        "name": "Wes Bos"
    },
    "created": "2017-03-08T17:09:21.627Z",
    "rating": 5,
    "store": "58c03a958060197ca0b52d50",
    "text": "I tried this place last week and it was incredible! Amazing selection of local and imported brews and the food is to die for! "
}, {
    "__v": 0,
    "_id": "58c03af28060197ca0b52d53",
    "author": {
        "__v": 0,
        "_id": "58c03ada8060197ca0b52d52",
        "email": "debbie@example.com",
        "hearts": [],
        "name": "Debbie Downer"
    },
    "created": "2017-03-08T17:10:10.426Z",
    "rating": 1,
    "store": "58c03a958060197ca0b52d50",
    "text": "hipsters everywhere"
}];

