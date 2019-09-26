import request from "supertest";
import { app } from "../server";

// const request = require('supertest');
// const express = require('express');
//
// const sampleApp = express();
//
// sampleApp.get('/user', function(req: any, res:any) {
//     res.status(200).json({ name: 'john' });
// });

test("example", async () => {
      //   request(sampleApp)
      // .get('/user')
      // .expect('Content-Type', /json/)
      // .expect('Content-Length', '15')
      // .expect(200)
      // .end((err:any, res:any) => {
      //     if (err) throw err;
      // });

    await request(app.app)
      .get("/james1")
      .expect("Content-Type", /json/)
      .expect("Content-Length", "15")
      .expect(200)
      .end((err: any, res: any) => {
          if (err) throw err;
      });
});
