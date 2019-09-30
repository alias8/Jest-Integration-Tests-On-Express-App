import dotenv from "dotenv";
import path from "path";
import yargs from "yargs";
import App from "./app";
import { AuthenticationController } from "./controllers/authController";
import { StoreController } from "./controllers/storeController";
import { UserController } from "./controllers/userController";

console.log(`yargs.argv.configEnvironment: ${JSON.stringify(yargs.argv)}`);

dotenv.config({
    path: path.resolve(
        __dirname,
        "config",
        yargs.argv.configEnvironment as string,
        ".env"
    )
});

export const app = new App([
    new UserController(),
    new StoreController(),
    new AuthenticationController()
]);
