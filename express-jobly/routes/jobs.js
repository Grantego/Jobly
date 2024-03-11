const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureIsAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobSearchSchema = require("../schemas/jobSearch.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const db = require("../db");

const router = new express.Router();

/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */

router.post("/", ensureIsAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobNewSchema)
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs)
        }
        const job = await Job.create(req.body)
        return res.status(201).json({ job })
    } catch(e) {
        next(e)
    }
})

/** GET /  =>
 *   { jobs:  { title, salary, equity, companyHandle } }
 *
 * Can filter on provided search filters:
 * - title (will find case-insensitive, partial matches)
 * - minSalary
 * - hasEquity (boolean)
 *
 * Authorization required: none
 */
router.get("/", async function(req, res, next) {
    try {
        let q = req.query

        if (q.minSalary !== undefined) q.minSalary = +q.minSalary
    
        const validator = jsonschema.validate(q, jobSearchSchema)
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack)
            throw new BadRequestError(errs)
        }
    
        const jobs = await Job.findAll(q)
        return res.json({jobs})
    } catch(e) {
        next(e)
    }
})


/** GET /[id]  =>  { job }
 *
 *  Job is { id, title, salary, equity, companyHandle }
 * 
 *
 * Authorization required: none
 */
router.get("/:id", async function(req, res, next) {
    try {
        const job = await Job.get(req.params.id)
        return res.json({job})
    } catch(e) {
        next(e)
    }
})

router.patch("/:id", ensureIsAdmin, async function(req,res,next) {
    try {
        const validator = jsonschema.validate(req.body, jobUpdateSchema)
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack)
            throw new BadRequestError(errs)
        }
        const job = await Job.update(req.params.id, req.body)
        return res.json({job})
    } catch(e) {
        return next(e)
    }
})


router.delete("/:id", ensureIsAdmin, async function(req, res, next) {
    try {
        await Job.remove(req.params.id)
        return res.json({deleted: req.params.id})
    }catch(e) {
        return next(e)
    }
})

module.exports = router