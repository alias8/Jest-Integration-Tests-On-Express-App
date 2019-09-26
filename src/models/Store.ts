import dompurify from "dompurify";
import mongoose, { model } from "mongoose";
import slug from "slugs";
import { DOMPurify } from "../helpers";
import { IUserModel } from "./User";

export interface IStoreDocument extends mongoose.Document {
    name: string;
    slug: string;
    description: string;
    tags: string;
    created: mongoose.Schema.Types.Date;
    location: {
        coordinates: number[];
        address: string;
    };
    photo: string;
    author: mongoose.Types.Buffer;
}

export interface IStoreModel extends mongoose.Model<IStoreDocument> {
    getTagsList: () => any;
    getTopStores: () => any;
}

const storeSchema = new mongoose.Schema<IStoreDocument>(
    {
        author: {
            ref: "User",
            required: "You must supply an author",
            type: mongoose.Schema.Types.ObjectId
        },
        created: {
            default: Date.now(),
            type: mongoose.Schema.Types.Date
        },
        description: {
            trim: true,
            type: mongoose.Schema.Types.String
        },
        location: {
            address: {
                required: "You must supply an address!",
                type: mongoose.Schema.Types.String
            },
            coordinates: [
                {
                    required: "You must supply coordinates!",
                    type: mongoose.Schema.Types.Number
                }
            ],
            type: {
                default: "Point",
                type: mongoose.Schema.Types.String
            }
        },
        name: {
            required: "Please enter a store name",
            trim: true,
            type: mongoose.Schema.Types.String
        },
        slug: mongoose.Schema.Types.String,
        tags: [mongoose.Schema.Types.String],

        photo: mongoose.Schema.Types.String
    },
    {
        toJSON: { virtuals: true }, // print virtual fields
        toObject: { virtuals: true }
    }
);

storeSchema.index({
    description: "text",
    name: "text"
});

storeSchema.index({
    location: "2dsphere"
});

// Give us the meta data for authors, not just their ID
function autopopulate(next: any) {
    this.populate("author");
    next();
}

storeSchema.pre("find", autopopulate);
storeSchema.pre("findOne", autopopulate);

// tslint:disable-next-line:only-arrow-functions console.log("hello")
storeSchema.pre("validate", async function(next) {
    // todo: somehow validate / sanitise using a pre hook or a validation option in the schema
    this.validateSync();
    next();
});

// tslint:disable-next-line:only-arrow-functions
storeSchema.pre("save", async function(next) {
    const that = this as IStoreDocument;
    if (!this.isModified("name")) {
        next();
        return;
    }

    that.slug = slug(that.name);
    // find other stores that have a slug of wes, wes-1, wes-2
    const slugRegEx = new RegExp(`^(${that.slug})((-/d*)?)$`, "i");
    const storesWithSlug = await Store.find({ slug: slugRegEx });

    if (storesWithSlug.length) {
        that.slug = `${that.slug}-${storesWithSlug.length + 1}`;
    }

    // sanitize all text inputs
    that.name = DOMPurify.sanitize(that.name);
    that.description = DOMPurify.sanitize(that.description);
    that.location.address = DOMPurify.sanitize(that.description);

    next();
});

storeSchema.statics.getTagsList = function() {
    return this.aggregate([
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
};

/*
 * We want a field on the Store schema that is an array of all reviews for
 * this store. The Review schema already has a field for the store, and
 * if we set a manual field in Store schema to remember all the reviews
 * we will be managing data in two places. Using a virtual field will
 * query the relevant fields for us.
 * */
// find reviews where the stores _id property === reviews store property
storeSchema.virtual("reviews", {
    foreignField: "store", // the field on the Review to match with the localField
    localField: "_id", // the field on our Store that needs to match with our foreignField
    ref: "Review" // the model to link
});

storeSchema.statics.getTopStores = function() {
    return this.aggregate([
        // Lookup stores and populate their reviews
        {
            $lookup: {
                as: "reviews", // what key the reviews will be under in the JSON
                foreignField: "store",
                from: "reviews", // what model name to link? MongoDB actually lowercases the model name and adds an s on the end
                localField: "_id"
            }
        },
        // filter for only items that have 2 or more reviews
        { $match: { "reviews.1": { $exists: true } } },
        // Add the average reviews field
        {
            $addFields: {
                averageRating: { $avg: "$reviews.rating" }
            }
        },
        // sort it by our new field, highest reviews first
        { $sort: { averageRating: -1 } },
        // limit to at most 10
        { $limit: 10 }
    ]);
};

export const Store: IStoreModel = mongoose.model<IStoreDocument, IStoreModel>(
    "Store",
    storeSchema
);
