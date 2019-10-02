import request from "supertest";
import { deleteData, loadData } from "../data/utils";
import { app } from "../server";
import { newUser, register } from "./util";

/*
* It seems authentication only works when we do it like this: const loggedInUser = request.agent(app.app);
* https://stackoverflow.com/questions/14001183/how-to-authenticate-supertest-requests-with-passport
* When a user is authenticated, a cookie is added to the header. So response.headers is:
   { 'x-powered-by': 'Express',
      'content-type': 'application/json; charset=utf-8',
      'content-length': '1220',
      etag: 'W/"4c4-mv4MOuvmq3/mdaPKNXoPMcy9Sus"',
      'set-cookie':
       [ 'sweetsesh=s%3AffFQ21k1KefNrrAiVqjpjOZQe55NhmCY.j%2BCEGmTAyolvsH4k5Igt3Wx834u5P%2BsLXDDKImwWGzo; Path=/; HttpOnly' ],
      date: 'Wed, 02 Oct 2019 03:29:45 GMT',
      connection: 'close' }
* */
const loggedInUser = request.agent(app.app);

beforeAll(async () => {
    await app.connectToTheDatabase(); // takes about 2 seconds
});

beforeEach(async () => {
    await deleteData(); // takes about 0.5 seconds
    await loggedInUser
        .post("/register")
        .send({
            ...newUser
        })
        .then((response: any) => {
            expect(response.body.user.email).toBe(newUser.email);
            console.log(response.headers);
            expect(response.status).toEqual(200);
        });
});

// test("registering with password mismatch returns error", async () => {
//   const newUser = {
//     email: "newuseremail@email.com",
//     name: "testuser",
//     password: "password123",
//     "password-confirm": "password1234"
//   };
//   await request(app.app)
//     .post("/register")
//     .send({
//       ...newUser
//     })
//     .expect(400)
//     .expect({
//       body : {
//         ...newUser,
//       },
//       errors: ["Oops! Your passwords do not match"]
//     });
// });
// test("registering with empty password returns error", async () => {
//   const newUser = {
//     email: "newuseremail@email.com",
//     name: "testuser",
//     password: "",
//     "password-confirm": ""
//   };
//   await request(app.app)
//     .post("/register")
//     .send({
//       ...newUser
//     })
//     .expect(400)
//     .expect({
//       body : {
//         ...newUser,
//       },
//       errors: ["Password Cannot be Blank!", "Confirmed Password cannot be blank!"]
//     });
// });
//
// test("registering with no name returns error", async () => {
//   const newUser = {
//     email: "newuseremail@email.com",
//     name: "",
//     password: "password123",
//     "password-confirm": "password123"
//   };
//   await request(app.app)
//     .post("/register")
//     .send({
//       ...newUser
//     })
//     .expect(400)
//     .expect({
//       body : {
//         ...newUser,
//       },
//       errors: ["You must supply a name!"]
//     });
// });
//
// test("registering with invalid email returns error", async () => {
//   const newUser = {
//     email: "newuseremail@",
//     name: "testuser",
//     password: "password123",
//     "password-confirm": "password123"
//   };
//   await request(app.app)
//     .post("/register")
//     .send({
//       ...newUser
//     })
//     .expect(400)
//     .expect({
//       body : {
//         ...newUser,
//       },
//       errors: ["That Email is not valid!"]
//     });
// });
//
// test("test good registration", async () => {
//   const newUser = {
//     email: "newuseremail@gmail.com",
//     name: "testuser",
//     password: "password123",
//     "password-confirm": "password123"
//   };
//   await request(app.app)
//     .post("/register")
//     .send({
//       ...newUser
//     })
//     .expect(302) // redirect
//     .expect('Location', /\/$/);
// });

test("user can update their details", async () => {
    await loggedInUser
        .post("/account")
        .send({
            email: "newuseremail2@gmail.com",
            name: "testuser2"
        })
        .expect({
            email: "newuseremail2@gmail.com",
            name: "testuser2"
        });
});
