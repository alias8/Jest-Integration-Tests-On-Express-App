import request from "supertest";
import express from "express";

test("example", () => {
  const app = express();

// @ts-ignore
  app.get('/user', function(req, res) {
    res.status(200).json({ name: 'john' });
  });
  request(app)
    .get('/user')
    .expect('Content-Type', /json/)
    .expect('Content-Length', '15')
    .expect(200)
    // @ts-ignore
    .end(function(err, res) {
      if (err) throw err;
    });
});

test("example2", () => {
  class App {
    public app: express.Application;

    constructor() {
      this.app = express();

      this.app.get('/user', function(req, res) {
        res.status(200).json({ name: 'john' });
      });
    }
  }
  const app = new App();
  request(app.app)
    .get('/user')
    .expect('Content-Type', /json/)
    .expect('Content-Length', '15')
    .expect(200)
    // @ts-ignore
    .end(function(err, res) {
      if (err) throw err;
    });
});
