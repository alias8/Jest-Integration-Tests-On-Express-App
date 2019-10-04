import express from "express";
import { IController } from "../app";
import { catchErrors } from "../handlers/errorHandlers";
import { Review } from "../models/Review";
import { AuthenticationController } from "./authController";

export class ReviewController implements IController {
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            "/reviews/:id",
            AuthenticationController.isLoggedIn,
            catchErrors(this.addReview)
        );
    }

    private addReview = async (
        request: express.Request,
        response: express.Response
    ) => {
        // @ts-ignore
        request.body.author = request.user._id;
        request.body.store = request.params.id;
        console.log(`adding review: ${JSON.stringify(request.body)}`);
        const newReview = new Review(request.body);
        await newReview.save();
        response.redirect("back");
    };
}
