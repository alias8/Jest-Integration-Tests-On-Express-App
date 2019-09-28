import fs from "fs";
import path from "path";
import { Store } from "../models/Store";
import { User } from "../models/User";
import { performance } from "perf_hooks";

const stores = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "stores.json"),
    "utf-8"
  )
);
const reviews = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "reviews.json"),
    "utf-8"
  )
);
const users = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "users.json"),
    "utf-8"
  )
);

export async function deleteData() {
  const t0 = performance.now();
  console.log("😢😢 Goodbye Data...");
  await Store.deleteMany({ name: /.*/ });
  // await Review.remove();
  await User.deleteMany({ name: /.*/ });
  console.log(
    "Data Deleted. To load sample data, run\n\n\t npm run sample\n\n"
  );
  const t1 = performance.now();
  console.log("Call to deleteData took " + (t1 - t0) + " milliseconds.");
}

export async function loadData() {
  try {
    await Store.insertMany(stores);
    // await Review.insertMany(reviews);
    await User.insertMany(users);
    console.log("👍👍👍👍👍👍👍👍 Done!");
    process.exit();
  } catch (e) {
    console.log(
      "\n👎👎👎👎👎👎👎👎 Error! The Error info is below but if you are importing sample data make sure to drop the existing database first with.\n\n\t npm run blowitallaway\n\n\n"
    );
    console.log(e);
  }
}
