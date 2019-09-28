import express from "express";
import { Promise } from "mongoose";
import { IController } from "../app";
import { catchErrors } from "../handlers/errorHandlers";
import { Store } from "../models/Store";

export class StoreController implements IController {
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/stores", catchErrors(this.getStores));
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
    response.status(200).send({
      count,
      page,
      pages,
      stores,
      title: "Stores"
    })
  };
}
