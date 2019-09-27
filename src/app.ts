import express, { Router } from "express";

export interface IController {
    router: Router;
}

class App {
    public app: express.Application;

    constructor(controllers: IController[]) {
        this.app = express();
        this.initializeControllers(controllers);
    }

    private initializeControllers(controllers: IController[]) {
        controllers.forEach(controller => {
            this.app.use("/", controller.router);
        });
    }
}

export default App;
