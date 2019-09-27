import express from "express";
import { IController } from "../app";

export class UserController implements IController {
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get("/user", (req, res) => {
            res.status(200).json({ name: "john" });
        });
    }
}
