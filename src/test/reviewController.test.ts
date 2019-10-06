import _ from "lodash";
import request from "supertest";
import { deleteData, loadData } from "../data/utils";
import { IStoreDocument, Store } from "../models/Store";
import { IUserDocument, User } from "../models/User";
import { app } from "../server";
import { exampleUserWes, loginExistingUser, newUser } from "./util";
import { IReviewDocument } from "../models/Review";

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
            text: "new review 123"
        })
        .expect(302);

    await loggedInUser
        .get("/store/rust-city-brewery")
        .then(response => {
            expect(
                response.body.store.reviews.some((review:IReviewDocument) => review.text.toString() === "new review 123")
            ).toBe(true);
        });
});
