import { app } from "./server";

app.connectToTheDatabase().then(() => {
  app.connectToTheDatabase().then(() => {
    console.log("second connect att");
    app.listen();
  })
});
