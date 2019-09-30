import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import htmlToText from "html-to-text";
import juice from "juice";
import path from "path";
import pug from "pug";
import yargs from "yargs";
import { IUserModel } from "../models/User";

dotenv.config({
    path: path.resolve(
        __dirname,
        "..",
        "config",
        yargs.argv.configEnvironment as string,
        ".env"
    )
});

const sendGridAPIKey = process.env.sendGridAPIKey;
if (!sendGridAPIKey) {
    throw new Error("sendGridAPIKey is undefined");
}
sgMail.setApiKey(sendGridAPIKey!);

const generateHTML = (filename: string, options = {}) => {
    const html = pug.renderFile(
        path.resolve(__dirname, "..", "views", `${filename}.pug`),
        options
    );
    return juice(html);
};

export const sendEmail = async ({
    user,
    subject,
    resetURL,
    filename
}: {
    user: IUserModel;
    subject: string;
    resetURL: string;
    filename: string;
}) => {
    const html = generateHTML(filename, { user, subject, resetURL, filename });
    const text = htmlToText.fromString(html);
    await sgMail
        .send({
            from: "James Kirk <jameskirk8@gmail.com>",
            html,
            subject,
            text,
            to: user.email
        })
        .then(response => {
            console.log("----------------1");
            return response[0].complete;
        })
        .catch(error => {
            console.log("----------------2");
            return error.message;
        });
};
