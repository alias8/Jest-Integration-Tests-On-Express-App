import { Store } from "../models/Store";
import { User } from "../models/User";
import reviews from "./reviews.json";
import stores from "./stores.json";
import users from "./users.json";

export async function deleteData() {
    await Store.deleteMany({ name: /.*/ });
    // await Review.remove();
    await User.deleteMany({ name: /.*/ });
}

export async function loadData() {
    try {
        await Store.insertMany(stores);
        // await Review.insertMany(reviews);
        await User.insertMany(users);
    } catch (e) {
        console.log(
            "\n👎👎👎👎👎👎👎👎 Error! The Error info is below but if you are importing sample data make sure to drop the existing database first with.\n\n\t npm run blowitallaway\n\n\n"
        );
        console.log(e);
    }
}
