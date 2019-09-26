/*
  Catch Errors Handler

  With async/await, you need some way to catch errors
  Instead of using try{} catch(e) {} in each controller, we wrap the function in
  catchErrors(), catch any errors they throw, and pass it along to our express middleware with next()
*/

import { NextFunction, Request, Response } from "express";

/*
 * Attaches a catch block to a function and calls
 * next()
 * */
export const catchErrors = (
    fn: (
        request: Request,
        response: Response,
        next: NextFunction
    ) => Promise<void>
) => (request: Request, response: Response, next: NextFunction) =>
    fn(request, response, next).catch(next);

/*
  Not Found Error Handler

  If we hit a route that is not found, we mark it as 404 and pass it along to the next error handler to display
*/
export const notFound = (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    const err = new Error("Not Found");
    (err as any).status = 404;
    next(err);
};

/*
  MongoDB Validation Error Handler

  Detect if there are mongodb validation errors that we can nicely show via flash messages
*/

export const flashValidationErrors = (
    err: any,
    request: Request,
    response: Response,
    next: NextFunction
) => {
    if (!err.errors) {
        return next(err);
    }
    // validation errors look like
    const errorKeys = Object.keys(err.errors);
    errorKeys.forEach(key => request.flash("error", err.errors[key].message));
    response.redirect("back");
};

/*
  Development Error Handler

  In development we show good error messages so if we hit a syntax error or any other previously un-handled error, we can show good info on what happened
*/
export const developmentErrors = (
    err: any,
    request: Request,
    response: Response,
    next: NextFunction
) => {
    err.stack = err.stack || "";
    const errorDetails = {
        message: err.message,
        stackHighlighted: err.stack.replace(
            /[a-z_-\d]+.js:\d+:\d+/gi,
            "<mark>$&</mark>"
        ),
        status: err.status
    };
    response.status(err.status || 500);
    response.format({
        // Form Submit, Reload the page
        "application/json": () => response.json(errorDetails), // Ajax call, sendEmail JSON back
        // Based on the `Accept` http header
        "text/html": () => {
            response.render("error", errorDetails);
        }
    });
};

/*
  Production Error Handler

  No stacktraces are leaked to user
*/
export const productionErrors = (
    err: any,
    request: Request,
    response: Response,
    next: NextFunction
) => {
    response.status(err.status || 500);
    response.render("error", {
        error: {},
        message: err.message
    });
};
