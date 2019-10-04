import dotenv from "dotenv";
import path from "path";
import yargs from "yargs";
import App from "./app";
import { AuthenticationController } from "./controllers/authController";
import { StoreController } from "./controllers/storeController";
import { UserController } from "./controllers/userController";

if (!["dev", "test", "prod"].some(env => process.env.ENV!.toString())) {
    throw new Error(
        "Environment must be set in the npm script eg. ENV=dev, ENV=test, ENV=prod"
    );
}

dotenv.config({
    path: path.resolve(__dirname, "config", process.env.ENV as string, ".env")
});

export const app = new App([
    new UserController(),
    new StoreController(),
    new AuthenticationController()
]);
