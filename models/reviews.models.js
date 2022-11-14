const db = require("../db/connection");
const format = require("pg-format");

exports.selectCategories = () => {
  return db.query("SELECT * FROM categories;").then((result) => {
    return result.rows;
  });
};
