const express = require("express");
const app = express();

const {
  getCategories,
  getReviews,
  getReview,
  getCommentsByReviewId,
  postComment,
  getUsers,
  patchReview,
  deleteComment,
  getAPIs,
} = require("./controllers/reviews.controllers");

app.use(express.json());

app.get("/api/categories", getCategories);

app.get("/api/reviews", getReviews);

app.get("/api/reviews/:review_id", getReview);

app.get("/api/reviews/:review_id/comments", getCommentsByReviewId);

app.post("/api/reviews/:review_id/comments", postComment);

app.get("/api/users", getUsers);

app.patch("/api/reviews/:review_id", patchReview);

app.delete("/api/comments/:comment_id", deleteComment);

app.get("/api", getAPIs);

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad Request" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.sendStatus(500).send("Internal Server Error");
});

module.exports = app;
