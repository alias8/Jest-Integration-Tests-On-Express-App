import App from "./app";
import { UserController } from "./controllers/userController";

export const app = new App([new UserController()]);
