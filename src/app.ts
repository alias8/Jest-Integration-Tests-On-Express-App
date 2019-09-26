import express, { Router } from "express";

export interface IController {
    router: Router;
}

class App {
    public app: express.Application;

    constructor(controllers?: IController[]) {
        this.app = express();

        this.app.get("/james", (
          request: express.Request,
          response: express.Response
        ) => {
            response.status(200).json({ name: 'john' });
        });
    }
}

export default App;
