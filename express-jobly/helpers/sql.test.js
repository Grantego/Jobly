const request = require("supertest");
const {sqlForPartialUpdate} = require('./sql.js')

describe("sqlForPartialUpdate()", function () {
    test("correctly returns object", function() {
        const dataToUpdate = {numEmployees: 5, logoUrl: 'www.google.com'}
        const jsToSql = {numEmployees: "num_employees", logoUrl: "logo_url"}

        expect(sqlForPartialUpdate(dataToUpdate, jsToSql)).toEqual(
            {setCols: '"num_employees"=$1, "logo_url"=$2',
            values: [5, 'www.google.com']}
            )
    })

    test("return error if no data passed in", function() {
        const jsToSql = {numEmployees: "num_employees", logoUrl: "logo_url"}       
        expect(() => {
            sqlForPartialUpdate({}, jsToSql)
        }).toThrow('No data')
    })
})