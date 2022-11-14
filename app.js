const express = require("express");
const app = express();

const {
  getCategories,
  getReviews,
} = require("./controllers/reviews.controllers");

app.use(express.json());

app.get("/api/categories", getCategories);

app.get("/api/reviews", getReviews);

module.exports = app;
