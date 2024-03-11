"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe("Job.create()", function() {
    test('works', async function() {
        const job = {
            title: "Adjuster",
            salary: 50000,
            equity: 0.50,
            companyHandle: "c1"
        }

    const res = await Job.create(job)
    expect(res).toEqual({
      id: expect.any(Number),
      title: "Adjuster",
      salary: 50000,
      equity: 0.5,
      companyHandle: "c1"
    })
    })
})


describe("Job.findAll()", function() {
  test('works with no search params', async function() {
      const res = await Job.findAll()
      expect(res).toEqual([
        {
          id: 1,
          title: "test job 1",
          salary: 25000,
          equity: 0.20,
          companyHandle: "c1"
        },
        {
          id: 2,
          title: "test job 2",
          salary: 65000,
          equity: 0.0,
          companyHandle: "c1"
        },
        {
          id: 3,
          title: "test job 3",
          salary: 65000,
          equity: 0.80,
          companyHandle: "c2"
        }
      ])
  })

  test('title search works', async function() {
    const res = await Job.findAll({title: "Test job 2"})
    expect(res).toEqual([
      {
        id: 2,
        title: "test job 2",
        salary: 65000,
        equity: 0.0,
        companyHandle: "c1"  
      }
    ])
  })

  test('minSalary search works', async function() {
    const res = await Job.findAll({minSalary: 64000})
    expect(res).toEqual([
      {
        id: 2,
        title: "test job 2",
        salary: 65000,
        equity: 0.0,
        companyHandle: "c1"
      },
      {
        id: 3,
        title: "test job 3",
        salary: 65000,
        equity: 0.80,
        companyHandle: "c2"
      }
    ])
  })

  test('hasEquity search works', async function() {
    const res = await Job.findAll({hasEquity: true})
    expect(res).toEqual([
      {
        id: 1,
        title: "test job 1",
        salary: 25000,
        equity: 0.2,
        companyHandle: "c1"
      },
      {
        id: 3,
        title: "test job 3",
        salary: 65000,
        equity: 0.8,
        companyHandle: "c2"
      }
    ])
  })

  test('hasEquity and minSalary work together', async function() {
    const res = await Job.findAll({minSalary: 50000, hasEquity: true})
    expect(res).toEqual([
      {
        id: 3,
        title: "test job 3",
        salary: 65000,
        equity: 0.8,
        companyHandle: "c2"
      }
    ])
  })
  
})


describe("Job.get(id)", function () {
  test(`works`, async function() {
    const res = await Job.get(1)
    expect(res).toEqual({
      id: 1,
      title: "test job 1",
      salary: 25000,
      equity: 0.20,
      companyHandle: "c1"
    })
  })

  test('returns NotFoundError if invalid id', async function() {
    try {
      const res = await Job.get(500)
    } catch(e) {
      expect (e instanceof NotFoundError).toBeTruthy()
    }
  })
})


describe("Job.update(id)", function() {
  const updateData = {
    title: "testing update",
    salary: 20000,
    equity: 0.80,
    companyHandle : "c2"
  }
  test(`works`, async function() {
    const res = await Job.update(1 , updateData)

    expect(res).toEqual({
      id: 1,
      ...updateData
    })

    const result = await db.query(
      `SELECT id, title, salary::integer, equity::float, company_handle 
       FROM jobs
       WHERE id = 1`
    )
    expect(result.rows[0]).toEqual({
      id: 1,
      title: "testing update",
      salary: 20000,
      equity: 0.80,
      company_handle: "c2"
    })
  })

  test("not found error if no such job", async function() {
    try {
      await Job.update(55, updateData)
    } catch(e) {
      expect(e instanceof NotFoundError).toBeTruthy()
    }
  })

  test("bad request with no data", async function() {
    try {
      await Job.update(1, {})
    }catch(e) {
      expect(e instanceof BadRequestError).toBeTruthy()
    }
  })
})


describe("Job.remove(id)", function() {
  test("works", async function() {
    await Job.remove(1)
    const res = await db.query(`
      SELECT id FROM jobs WHERE id=1`)
    
    expect(res.rows.length).toEqual(0)
  })

  test("not found if no such job", async function() {
    try {
      await Job.remove(45)
    } catch(e) {
      expect(e instanceof NotFoundError).toBeTruthy();
    }
  })
})