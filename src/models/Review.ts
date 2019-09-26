import mongoose, { Schema } from "mongoose";

export interface IReview extends mongoose.Document {
    author: mongoose.Types.Buffer;
    created: mongoose.Schema.Types.Date;
    rating: {
        max: 5;
        min: 0;
    };
    store: mongoose.Types.Buffer;
    text: mongoose.Schema.Types.String;
}

const reviewSchema = new mongoose.Schema({
    author: {
        ref: "User",
        required: "You must supply an author!",
        type: mongoose.Schema.Types.ObjectId
    },
    created: {
        default: Date.now(),
        type: mongoose.Schema.Types.Date
    },
    rating: {
        max: 5,
        min: 1,
        type: mongoose.Schema.Types.Number
    },
    store: {
        ref: "Store",
        required: "You must supply a store!",
        type: mongoose.Schema.Types.ObjectId
    },
    text: {
        required: "Your review must have text!",
        type: mongoose.Schema.Types.String
    }
});

// Give us the meta data for authors, not just their ID
function autopopulate(next: any) {
    this.populate("author");
    next();
}

reviewSchema.pre("find", autopopulate);
reviewSchema.pre("findOne", autopopulate);

export const Review: mongoose.Model<IReview> = mongoose.model<IReview>(
    "Review",
    reviewSchema
);
