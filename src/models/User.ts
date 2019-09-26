import md5 from "md5";
import mongoose, {
    model,
    PassportLocalDocument,
    PassportLocalModel,
    PassportLocalSchema,
    Schema
} from "mongoose";
import mongodbErrorHandler from "mongoose-mongodb-errors";
import passportLocalMongoose from "passport-local-mongoose";
import validator from "validator";

export interface IUserModel extends PassportLocalDocument {
    email: string;
    name: string;
    resetPasswordToken: string | undefined;
    resetPasswordExpires: number | undefined;
    hearts: mongoose.Schema.Types.ObjectId[];
}

const userSchema = new Schema<IUserModel>({
    email: {
        lowercase: true,
        required: "Please supply an email address",
        trim: true,
        type: mongoose.Schema.Types.String,
        unique: true,
        validate: [validator.isEmail, "Invalid Email Address"]
    },
    hearts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Store" }],
    name: {
        required: "Please supply a name",
        trim: true,
        type: mongoose.Schema.Types.String
    },
    resetPasswordExpires: mongoose.Schema.Types.Date,
    resetPasswordToken: mongoose.Schema.Types.String
});

userSchema.plugin(passportLocalMongoose, { usernameField: "email" });
userSchema.plugin(mongodbErrorHandler as any);

userSchema.virtual("gravatar").get(function() {
    const hash = md5(this.email);
    return `https://gravatar.com/avatar/${hash}?s=200`;
});

export const User: PassportLocalModel<IUserModel> = model<IUserModel>(
    "User",
    userSchema as PassportLocalSchema
);
