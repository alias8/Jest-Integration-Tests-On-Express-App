import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import htmlToText from "html-to-text";
import juice from "juice";
import nodemailer from "nodemailer";
import path from "path";
import pug from "pug";
import yargs from "yargs";
import { IUserDocument } from "../models/User";

dotenv.config({
    path: path.resolve(
        __dirname,
        "..",
        "config",
        process.env.ENV as string,
        ".env"
    )
});

if (
    !process.env.MAIL_PASS ||
    !process.env.MAIL_USER ||
    !process.env.MAIL_HOST ||
    !process.env.MAIL_PORT
) {
    throw new Error("Mailtrap environment variables not defined");
}
// Use this for developemnt and testing environments
const transport = nodemailer.createTransport({
    auth: {
        pass: process.env.MAIL_PASS,
        user: process.env.MAIL_USER
    },
    debug: true,
    host: process.env.MAIL_HOST,
    port: (process.env.MAIL_PORT as unknown) as number
});

// Use this for production environment
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
    user: IUserDocument;
    subject: string;
    resetURL: string;
    filename: string;
}) => {
    const html = generateHTML(filename, { user, subject, resetURL, filename });
    const text = htmlToText.fromString(html);
    if (process.env.NODE_ENV === "prod") {
        await sgMail
            .send({
                from: "James Kirk <jameskirk8@gmail.com>",
                html,
                subject,
                text,
                to: user.email
            })
            .then(response => {
                return response[0].complete;
            })
            .catch(error => {
                return error.message;
            });
    } else {
        await transport.sendMail({
            from: "James Kirk <jameskirk8@gmail.com>",
            html,
            subject,
            text,
            to: user.email
        });
    }
};
