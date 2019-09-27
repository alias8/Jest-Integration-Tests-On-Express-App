import dotenv from "dotenv";
import path from "path";
import yargs from "yargs";
import App from "./app";
import { UserController } from "./controllers/userController";

console.log(`args in server.ts:`);
console.log(yargs.argv);
dotenv.config({
    path: path.resolve(__dirname, "config", yargs.argv.env as string, ".env")
});

export const app = new App([new UserController()]);
