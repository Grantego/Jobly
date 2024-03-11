"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
/** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, companyHandle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws BadRequestError if company already in database.
   * */
   static async create({title, salary, equity, companyHandle}) {
    const res = await db.query(`
        INSERT INTO jobs (title, salary, equity, company_handle)
        VALUES ($1, $2, $3, $4)
        RETURNING  id, title, salary::integer, equity::float , company_handle AS "companyHandle"`,
        [title, salary, equity, companyHandle])

    const job = res.rows[0]

    return job;
   }
   
   /** Find all companies.
   *
   * Returns [{id, title, salary, equity, companyHandle}, ...]
   * 
   * 
   * Can also take an optional query parameters in an object with values: {name, minEmployees, maxEmployees}
   * */
    static async findAll(q = {}) {
    let statement = `SELECT id, title, salary::integer, equity::float, company_handle as "companyHandle"
        FROM jobs`
        let queries = []
        let values = []

        let {title, minSalary, hasEquity} = q

        if (title !== undefined) {
            values.push(`%${title}%`)
            queries.push(`title ILIKE $${values.length}`)
        }

        if (minSalary !== undefined) {
            values.push(minSalary)
            queries.push(`salary >= $${values.length}`)
        }

        if (hasEquity === true) {
            queries.push(`equity > 0`)
        }

        if (values.length > 0 || hasEquity === true) {
            statement += ' WHERE ' + queries.join(' AND ')
        }
        statement += " ORDER BY title";

        console.log(statement)
        const res = await db.query(statement, values)

        if (res.rows.length === 0) {
            throw new NotFoundError()
        }

        return res.rows;
   }

  /** Given a job id, return data about the job.
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   **/
    static async get(id) {
        const res = await db.query(
            `SELECT id,
                    title,
                    salary::integer,
                    equity::float,
                    company_handle AS "companyHandle"
             FROM jobs
             WHERE id = $1
            `, [id]
        )
        
        const job = res.rows[0]

        if (!job) throw new NotFoundError(`No job with id: ${id}`)
        
        return job;
   }
   
    /** Update company data with `data`.
 *
 * This is a "partial update" --- it's fine if data doesn't contain all the
 * fields; this only changes provided ones.
 *
 * Data can include: {name, description, numEmployees, logoUrl}
 *
 * Returns {handle, name, description, numEmployees, logoUrl}
 *
 * Throws NotFoundError if not found.
 */
    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                companyHandle: "company_handle"
            }
        )
        const idIdx = "$" + (values.length+1)

        const querySql = `UPDATE jobs
            SET ${setCols} 
            WHERE id = ${idIdx}
            RETURNING id::integer, title, salary::integer, equity::float, company_handle AS "companyHandle"`

        const res = await db.query(querySql, [...values, id])

        const job = res.rows[0]

        if (!job) throw new NotFoundError(`No job with id: ${id}`)

        return job
    }

    static async remove(id) {
        const result = await db.query(
            `DELETE
             FROM jobs
             WHERE id = $1
             returning id`,
             [id]
        )
        const job = result.rows[0]

        if (!job) throw new NotFoundError(`No job with id: ${id}`)
    }
}


module.exports = Job