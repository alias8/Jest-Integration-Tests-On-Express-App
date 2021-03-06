import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { deleteData, loadData } from "./utils";

dotenv.config({
    path: path.resolve(
      __dirname,
      "config",
        process.env.ENV as string,
      ".env"
    )
});

mongoose.connect(process.env.DATABASE || "", {
    useCreateIndex: true,
    useNewUrlParser: true
}).then(() => {
    if (process.argv.includes("--delete")) {
        deleteData();
    } else {
        loadData();
    }
});

// import all of our models - they need to be imported only once

// const Review = require('../models/Review');


