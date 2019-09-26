import express, { Router } from "express";
import { AddressInfo } from "net";

export interface IController {
    // path: string;
    router: Router;
}

class App {
    public app: express.Application;

    constructor(controllers: IController[]) {
        this.app = express();
        // this.app.set("port", process.env.PORT);

        this.app.get("/james1", (
          request: express.Request,
          response: express.Response
        ) => {
            response.status(200).json({ name: 'john1' });
        });
        // this.initializeControllers(controllers);
    }

    public listen() {
        const server = this.app.listen(this.app.get("port"), () => {
            console.log(
                `Express running → PORT ${
                    (server.address() as AddressInfo).port
                }`
            );
        });
    }

    private initializeControllers(controllers: IController[]) {
        controllers.forEach(controller => {
            this.app.use("/", controller.router);
        });
    }
}

export default App;
