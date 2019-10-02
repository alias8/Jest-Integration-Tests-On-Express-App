import crypto from "crypto";
import { promisify } from "es6-promisify";
import express from "express";
import moment from "moment";
import passport from "passport";
import { IController } from "../app";
import { catchErrors } from "../handlers/errorHandlers";
import { sendEmail } from "../handlers/mail";
import { IUserModel, User } from "../models/User";
import { StoreController } from "./storeController";

export class AuthenticationController implements IController {
    public static isLoggedIn = (
        request: express.Request,
        response: express.Response,
        next: express.NextFunction
    ) => {
        // 1. check if user auth
        if (request.isAuthenticated()) {
            next();
        } else {
            response.status(401).send();
        }
    };
    public router = express.Router();
    private user = User;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            "/login",
            passport.authenticate("local"),
            (request: express.Request, response: express.Response) => {
                // If this function gets called, authentication was successful.
                // `req.user` contains the authenticated user.
                response.json({ user: request.user });
                // if auth fails, 401 is returned
            }
        );

        this.router.get("/logout", this.logout);
        this.router.post("/account/forgot", catchErrors(this.forgot));
        this.router.get(
            "/account/reset/:token",
            catchErrors(this.isTokenValid)
        );
        this.router.post(
            "/account/reset/:token",
            this.confirmPasswords,
            catchErrors(this.update)
        );
    }

    private logout = (request: express.Request, response: express.Response) => {
        request.logout();
        response.json({ loggedIn: false });
    };

    private forgot = async (
        request: express.Request,
        response: express.Response
    ) => {
        /*
         * keep the output of this function the same whether a user with
         * that email exists or not
         * */
        const finalStage = () => {
            response.json({
                message: `A password reset email has been sent to ${request.body.email}`
            });
        };

        // 1 see if user with that email exists
        const user = await this.user.findOne({ email: request.body.email });
        if (!user) {
            finalStage();
        } else {
            // 2. set reset tokens and expiry on their account
            user.resetPasswordToken = crypto.randomBytes(20).toString("hex");
            user.resetPasswordExpires =
                moment.now() + moment.duration(1, "hour").asMilliseconds();
            await user.save();
            // 3. sendEmail back token
            await sendEmail({
                filename: "password-reset",
                resetURL: `http://${request.headers.host}/account/reset/${user.resetPasswordToken}`,
                subject: "Password Reset",
                user
            });
            finalStage();
        }
    };
    private isTokenValid = async (
        request: express.Request,
        response: express.Response
    ) => {
        const user = await User.findOne({
            resetPasswordExpires: { $gt: Date.now() },
            resetPasswordToken: request.params.token
        });
        if (!user) {
            response.json({
                error: "Password reset is invalid or has expired",
                tokenValid: false
            });
        }
        // if user is found, show reset pasword form
        response.json({
            tokenValid: true
        });
    };
    private confirmPasswords = (
        request: express.Request,
        response: express.Response,
        next: express.NextFunction
    ) => {
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
            response.json({
                errors: errors.map((err: any) => err.msg)
            });
        }
        next(); // there were no errors!
    };

    private update = async (
        request: express.Request,
        response: express.Response
    ) => {
        const user: IUserModel | null = await User.findOne({
            resetPasswordExpires: { $gt: Date.now() },
            resetPasswordToken: request.params.token
        });

        if (!user) {
            response.json({
                error: "Password reset is invalid or has expired",
                tokenValid: false
            });
        } else {
            const setPassword = promisify(user.setPassword.bind(user));
            await setPassword(request.body.password);
            user.resetPasswordExpires = undefined;
            user.resetPasswordToken = undefined;
            const updatedUser = await user.save();

            await (request as any).login(updatedUser);
            response.json({
                message: "Your password has been reset! You are now logged in"
            });
        }
    };
}
