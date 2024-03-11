const { BadRequestError } = require("../expressError");

/** Takes in request data and an object that has the psql name as the value and JS name as the key(example below)
 *  and returns an object of strings containing sequel 
 * 
 * dataToUpdate can be: any valid data fields 
 * 
 * jsToSql can be: {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
        }
 *
 * Example: sqlForPartialUpdate({numEmployees: 5, logoUrl: 'www.google.com'}, {numEmployees: "num_employees", logoUrl: "logo_url"})
 * returns {setCols: '"num_employees" = $1, "logo_url" = $2',
 *          values: [5, 'www.google.com']}
 *
 * 
 * Authorization required: login
 */


function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
