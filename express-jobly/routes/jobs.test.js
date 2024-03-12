"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  jobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function() {
    const newJob = {
        title: "new",
        salary: 7000,
        equity: 0.10,
        companyHandle: "c3"
    }
    
    test("ok for admins", async function() {
        const res = await request(app)
            .post('/jobs')
            .send(newJob)
            .set('authorization', `Bearer ${u1Token}`)
        expect(res.statusCode).toEqual(201)
        expect(res.body).toEqual({job : {
            id: expect.any(Number),
            title: "new",
            salary: 7000,
            equity: 0.10,
            companyHandle: "c3"
        }})
    })
    
    test("unauth for users", async function() {
        const res = await request(app)
            .post('/jobs')
            .send(newJob)
            .set('authorization', `Bearer ${u2Token}`)
        expect(res.statusCode).toEqual(401)
    })

    test("bad request with missing data", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
              title: "new",
              salary: 10,
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(400);
      });

      
  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
            title: "new",
            salary: "not number",
            equity: 0.10,
            companyHandle: "c3"
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
})


/************************************** GET /jobs */
describe("GET /jobs", function() {
    test("okay for anon", async function() {
        const resp = await request(app)
            .get("/jobs")
        
        expect(resp.statusCode).toEqual(200)
        expect(resp.body).toEqual({jobs : [
            {
                id: jobIds[0],
                title: "test job 1",
                salary: 25000,
                equity: 0.20,
                companyHandle: "c1"
            },
            {
                id: jobIds[1],
                title: "test job 2",
                salary: 65000,
                equity: 0,
                companyHandle: "c1"
            },
            {
                id: jobIds[2],
                title: "test job 3",
                salary: 65000,
                equity: 0.80,
                companyHandle: "c2" 
            }
        ]})
    
    })

    test("works with params", async function() {
        const resp = await request(app)
            .get("/jobs?minSalary=64000")
        
        expect(resp.statusCode).toEqual(200)
        expect(resp.body).toEqual({jobs : [
            {
                id: jobIds[1],
                title: "test job 2",
                salary: 65000,
                equity: 0,
                companyHandle: "c1"
            },
            {
                id: jobIds[2],
                title: "test job 3",
                salary: 65000,
                equity: 0.80,
                companyHandle: "c2" 
            }
        ]})       
    })
})

/************************************** GET /jobs/:id */
describe("GET /jobs:id", function() {
    test("okay for anon", async function() {
        const resp = await request(app)
            .get(`/jobs/${jobIds[0]}`)
        expect(resp.statusCode).toEqual(200)
        expect(resp.body).toEqual({job : 
            {
                id: jobIds[0],
                title: "test job 1",
                salary: 25000,
                equity: 0.20,
                companyHandle: "c1"
            }
        })       
    })
})


/************************************** PATCH /jobs/:id */
describe("PATCH /jobs:id", function() {
    test("works for admins", async function() {
        const resp = await request(app)
            .patch(`/jobs/${jobIds[0]}`)
            .send({
                title: "testjob1"
            })
            .set("authorization", `Bearer ${u1Token}`)
        expect(resp.statusCode).toEqual(200)
        expect(resp.body).toEqual({ job : {
            id: jobIds[0],
            title: "testjob1",
            salary: 25000,
            equity: 0.20,
            companyHandle: "c1"
        }})
    })

    test("bad request with invalid data", async function () {
        const resp = await request(app)
            .patch(`/jobs/${jobIds[0]}`)
            .send({
                title: "new",
                salary: "not number",
                equity: 0.10,
                companyHandle: "c3"
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(400);
      });
      
    test("unauth for users", async function() {
    const res = await request(app)
        .patch(`/jobs/${jobIds[0]}`)
        .send({
            title: "testjob1"
        })
        .set('authorization', `Bearer ${u2Token}`)
    expect(res.statusCode).toEqual(401) 
    })

    test("unauth for anon", async function() {
    const res = await request(app)
        .patch(`/jobs/${jobIds[0]}`)
        .send({
            title: "testjob1"
        })
    expect(res.statusCode).toEqual(401)
    })

})


/************************************** DELETE /jobs/:id */
describe("DELETE /jobs:id", function() {
    test("works for admins", async function() {
        const resp = await request(app)
            .delete(`/jobs/${jobIds[0]}`)
            .set("authorization", `Bearer ${u1Token}`)
            expect(resp.statusCode).toEqual(200)
        expect(resp.body).toEqual({deleted: `${jobIds[0]}`})

        const check = await request(app)
            .get("/jobs")
        expect(check.body.jobs.length).toEqual(2)
    })
      
    test("unauth for users", async function() {
    const res = await request(app)
        .delete(`/jobs/${jobIds[0]}`)
        .set('authorization', `Bearer ${u2Token}`)
    expect(res.statusCode).toEqual(401) 
    })

    test("unauth for anon", async function() {
    const res = await request(app)
        .delete(`/jobs/${jobIds[0]}`)

    expect(res.statusCode).toEqual(401)
    })

})