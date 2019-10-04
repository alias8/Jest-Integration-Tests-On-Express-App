import { Store } from "../models/Store";
import { User } from "../models/User";
import reviews from "./reviews.json";
import stores from "./stores.json";
import users from "./users.json";
import { Review } from "../models/Review";

export async function deleteData() {
    await Store.deleteMany({  });
    await Review.deleteMany({});
    await User.deleteMany({  });
}

export async function loadData() {
    try {
        await Store.insertMany(stores);
        await Review.insertMany(reviews);
        await User.insertMany(users);
    } catch (e) {
        console.log(
            "Error! The Error info is below but if you are importing sample data make sure to drop the existing database first"
        );
        console.log(e);
    }
}
