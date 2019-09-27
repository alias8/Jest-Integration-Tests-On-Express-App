import dotenv from "dotenv";
import path from "path";
import yargs from "yargs";
import App from "./app";
import { UserController } from "./controllers/userController";

dotenv.config({
    path: path.resolve(
        __dirname,
        "config",
        yargs.argv.configEnvironment as string,
        ".env"
    )
});

export const app = new App([new UserController()]);
