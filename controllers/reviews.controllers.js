const {
  selectCategories,
  selectReviews,
  selectReview,
  selectCommentsByReviewId,
  insertComment,
  selectUsers,
} = require("../models/reviews.models");

exports.getCategories = (req, res, next) => {
  selectCategories().then((categories) => {
    res.send({ categories });
  });
};

exports.getReviews = (req, res, next) => {
  selectReviews().then((reviews) => {
    res.send({ reviews });
  });
};

exports.getReview = (req, res, next) => {
  const { review_id } = req.params;
  selectReview(review_id)
    .then((review) => {
      res.send({ review });
    })
    .catch((err) => next(err));
};

exports.getCommentsByReviewId = (req, res, next) => {
  const { review_id } = req.params;
  selectCommentsByReviewId(review_id)
    .then((comments) => {
      res.send({ comments });
    })
    .catch((err) => next(err));
};

exports.postComment = (req, res, next) => {
  const { review_id } = req.params;
  const { username, body } = req.body;
  insertComment(review_id, username, body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => next(err));
};

exports.getUsers = (req, res, next) => {
  selectUsers()
    .then((users) => {
      res.send({ users });
    })
    .catch((err) => next(err));
};
