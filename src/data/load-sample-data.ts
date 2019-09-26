import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import { Review } from "../models/Review";
import { Store } from "../models/Store";
import { User } from "../models/User";
import { rootDirectory } from "../paths";

dotenv.config({ path: path.join(rootDirectory, "variables.env") });
mongoose.connect(process.env.DATABASE || "", {
    useCreateIndex: true,
    useNewUrlParser: true
});

// import all of our models - they need to be imported only once

// const Review = require('../models/Review');

const stores = JSON.parse(
    fs.readFileSync(
        path.join(rootDirectory, "src", "data", "stores.json"),
        "utf-8"
    )
);
const reviews = JSON.parse(
    fs.readFileSync(
        path.join(rootDirectory, "src", "data", "reviews.json"),
        "utf-8"
    )
);
const users = JSON.parse(
    fs.readFileSync(
        path.join(rootDirectory, "src", "data", "users.json"),
        "utf-8"
    )
);

async function deleteData() {
    console.log("😢😢 Goodbye Data...");
    await Store.deleteMany({ name: /.*/ });
    // await Review.remove();
    await User.deleteMany({ name: /.*/ });
    console.log(
        "Data Deleted. To load sample data, run\n\n\t npm run sample\n\n"
    );
    process.exit();
}

async function loadData() {
    try {
        await Store.insertMany(stores);
        await Review.insertMany(reviews);
        await User.insertMany(users);
        console.log("👍👍👍👍👍👍👍👍 Done!");
        process.exit();
    } catch (e) {
        console.log(
            "\n👎👎👎👎👎👎👎👎 Error! The Error info is below but if you are importing sample data make sure to drop the existing database first with.\n\n\t npm run blowitallaway\n\n\n"
        );
        console.log(e);
        process.exit();
    }
}

if (process.argv.includes("--delete")) {
    deleteData();
} else {
    loadData();
}
