import { promisify } from "es6-promisify";
import express from "express";
import passport from "passport";
import { IController } from "../app";
import { catchErrors } from "../handlers/errorHandlers";
import { User } from "../models/User";
import { AuthenticationController } from "./authController";

export class UserController implements IController {
    public router = express.Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            "/register",
            this.validateRegister,
            this.register,
            passport.authenticate("local"),
            (req, res) => {
                // If this function gets called, authentication was successful.
                // `req.user` contains the authenticated user.
                res.redirect("/");
                // if auth fails, 401 is returned
            }
        );

        this.router.get("/account", AuthenticationController.isLoggedIn);
        this.router.post("/account", catchErrors(this.updateAccount));
    }

    private validateRegister = (
        request: express.Request,
        response: express.Response,
        next: express.NextFunction
    ) => {
        request.sanitizeBody("name");
        request.checkBody("name", "You must supply a name!").notEmpty();
        request.checkBody("email", "That Email is not valid!").isEmail();
        request.sanitizeBody("email").normalizeEmail({
            gmail_remove_dots: false,
            gmail_remove_subaddress: false
        });
        request.checkBody("password", "Password Cannot be Blank!").notEmpty();
        request
            .checkBody(
                "password-confirm",
                "Confirmed Password cannot be blank!"
            )
            .notEmpty();
        request
            .checkBody("password-confirm", "Oops! Your passwords do not match")
            .equals(request.body.password);

        const errors = request.validationErrors();
        if (errors) {
            response.status(400).json({
                body: request.body,
                errors: errors.map((err: any) => err.msg)
            });
            return;
        }

        next(); // there were no errors!
    };

    private register = async (
        request: express.Request,
        response: express.Response,
        next: express.NextFunction
    ) => {
        const user = new User({
            email: request.body.email,
            name: request.body.name
        });
        const register = promisify(User.register.bind(User)); // register method comes from passportLocalMongoose plugin
        await register(user, request.body.password); // hash the password and save to database
        next(); // pass to authController.login
    };

    private updateAccount = async (
        request: express.Request,
        response: express.Response
    ) => {
        const updates = {
            email: request.body.email,
            name: request.body.name
        };

        const user = await User.findOneAndUpdate(
            // @ts-ignore
            { _id: request.user._id },
            { $set: updates },
            { new: true, runValidators: true, context: "query" }
        );

        response.redirect("/");
    };
}
