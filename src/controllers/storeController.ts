import express from "express";
import jimp from "jimp";
import mongoose, { Promise } from "mongoose";
import multer, { Options } from "multer";
import path from "path";
import uuid from "uuid";
import { IController } from "../app";
import { catchErrors } from "../handlers/errorHandlers";
import { IStoreDocument, Store } from "../models/Store";
import { IUserDocument, User } from "../models/User";
import { AuthenticationController } from "./authController";

export class StoreController implements IController {
    public router = express.Router();

    private multerOptions: Options = {
        storage: multer.memoryStorage(),
        fileFilter(request: express.Request, file, next) {
            const isPhoto = file.mimetype.startsWith("image/");
            if (isPhoto) {
                next(null, true);
            } else {
                next(
                    { message: "That file type isn't allowed", name: "" },
                    false
                );
            }
        }
    };

    private upload = multer(this.multerOptions).single("photo");

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            "/add",
            AuthenticationController.isLoggedIn,
            this.upload,
            catchErrors(this.resize),
            catchErrors(this.createStore)
        );
        this.router.post(
            "/add/:id",
            AuthenticationController.isLoggedIn,
            this.upload,
            catchErrors(this.resize),
            catchErrors(this.updateStore)
        );

        this.router.get("/store/:slug", catchErrors(this.getStoreBySlug)); // clicking on individual store
        this.router.get("/tags", catchErrors(this.getStoresByTag));
        this.router.get("/tags/:tag", catchErrors(this.getStoresByTag));
        this.router.get("/api/search", catchErrors(this.searchStores));
        this.router.get("/api/stores/near", catchErrors(this.mapStores));
        this.router.post(
            "/api/stores/:id/heart",
            AuthenticationController.isLoggedIn,
            catchErrors(this.heartStore)
        );
        this.router.post(
            "/hearts",
            AuthenticationController.isLoggedIn,
            catchErrors(this.getHearts)
        );
        this.router.get("/", catchErrors(this.getStores));
        this.router.get("/stores", catchErrors(this.getStores));
        this.router.get("/top", catchErrors(this.getTopStores));
        this.router.get("/stores/page/:page", catchErrors(this.getStores));
    }

    private getStores = async (
        request: express.Request,
        response: express.Response
    ) => {
        const page = request.params.page || 1;
        const limit = 4;
        // @ts-ignore
        const skip = page * limit - limit;
        // 1. query the database for a list of all stores
        const storesPromise = Store.find()
            .skip(skip)
            .limit(limit)
            .sort({ created: "desc" });

        const countPromise = Store.count({});

        const [stores, count] = await Promise.all([
            storesPromise,
            countPromise
        ]);
        const pages = Math.ceil(count / limit);
        if (!stores.length && skip) {
            // what should response be?
            response.redirect(`/stores/page/${pages}`);
        }
        response.send({
            count,
            page,
            pages,
            stores,
            title: "Stores"
        });
    };

    private resize = async (
        request: express.Request,
        response: express.Response,
        next: express.NextFunction
    ) => {
        if (!request.file) {
            next();
            return;
        }
        const extension = request.file.mimetype.split("/")[1];
        request.body.photo = `${uuid.v4()}.${extension}`;
        const photo = await jimp.read(request.file.buffer);
        await photo.resize(800, jimp.AUTO);
        await photo.write(
            path.join(__dirname, "..", "public", "uploads", request.body.photo)
        );
        // once we have written photo to file system
        next();
    };

    private createStore = async (
        request: express.Request,
        response: express.Response
    ) => {
        // @ts-ignore
        request.body.author = request.user._id;
        const store = new Store(request.body);
        await store.save();
        request.flash(
            "success",
            `Successfully created ${store.name}. Care to leave a review?`
        );
        response.redirect(`/store/${store.slug}`);
    };

    private confirmOwner = (store: IStoreDocument, user: IUserDocument) => {
        if (!store.author.equals(user._id)) {
            throw Error("You must own a store in order to edit it!");
        }
    };

    private updateStore = async (
        request: express.Request,
        response: express.Response
    ) => {
        // 1. find and update the store
        request.body.location.type = "Point";
        /*
         * don't use findOneAndUpdate() because it won't trigger the
         * 'save' prehook which sanitizes the data
         * */
        const oldStore = await Store.findOne({ _id: request.params.id });

        if (oldStore) {
            oldStore.name = request.body.name;
            oldStore.description = request.body.description;
            oldStore.location.address = request.body.description;
            const newStore = await oldStore.save();
            request.flash("success", `Successfully updated ${newStore!.name}`);
            response.redirect(`/stores/${newStore!._id}/edit`);
        }
    };

    private getStoreBySlug = async (
        request: express.Request,
        response: express.Response,
        next: express.NextFunction
    ) => {
        const store = await Store.findOne({
            slug: request.params.slug
        }).populate("author reviews"); // populate means insert the entire author and reviews objects, not just their ids
        if (!store) {
            response.json({store: []});
        }
        response.json({store});
    };

    private getStoresByTag = async (
        request: express.Request,
        response: express.Response,
        next: express.NextFunction
    ) => {
        const tag = request.params.tag;
        const tagQuery = tag || { $exists: true };
        const tagsPromise = Store.getTagsList();
        const storesPromise = Store.find({ tags: tagQuery });
        const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
        response.json({tags, stores});
    };

    private searchStores = async (
        request: express.Request,
        response: express.Response
    ) => {
        const stores = await Store
            // find stores that match
            .find(
                {
                    $text: {
                        $search: request.query.q
                    }
                },
                {
                    score: {
                        $meta: "textScore"
                    }
                }
            )
            // then sort them
            .sort({
                score: {
                    $meta: "textScore"
                }
            })
            // limit to 5 result
            .limit(5);
        response.json({stores});
    };

    private mapStores = async (
        request: express.Request,
        response: express.Response
    ) => {
        const coordinates = [request.query.lng, request.query.lat].map(
            parseFloat
        );
        const query = {
            location: {
                $near: {
                    $geometry: {
                        coordinates,
                        type: "Point"
                    },
                    $maxDistance: 10 * 1000 // 10km
                }
            }
        };
        const stores = await Store.find(query)
            .select("slug name description location photo")
            .limit(10);
        response.json({ stores });
    };

    private heartStore = async (
        request: express.Request,
        response: express.Response
    ) => {
        // @ts-ignore
        const operator = request.user.hearts.includes(request.params.id)
            ? "$pull"
            : "$addToSet";

        const user = await User.findByIdAndUpdate(
            // @ts-ignore
            request.user._id,
            {
                [operator]: {
                    hearts: request.params.id
                }
            },
            { new: true }
        );
        response.json({ user });
    };

    private getHearts = async (
        request: express.Request,
        response: express.Response
    ) => {
        const stores = await Store.find({
            // @ts-ignore
            _id: { $in: request.user.hearts }
        });
        response.json({ stores });
    };

    private getTopStores = async (
        request: express.Request,
        response: express.Response
    ) => {
        // 1. query the database for a list of all stores
        const stores = await Store.getTopStores();
        response.json({ stores });
    };
}
