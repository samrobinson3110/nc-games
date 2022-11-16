const {
  selectCategories,
  selectReviews,
  selectReview,
  selectCommentsByReviewId,
  insertComment,
  alterVotes,
  selectUsers,
  removeComment,
} = require("../models/reviews.models");

exports.getCategories = (req, res, next) => {
  selectCategories().then((categories) => {
    res.send({ categories });
  });
};

exports.getReviews = (req, res, next) => {
  const { sort_by, order, category } = req.query;
  selectReviews(sort_by, order, category)
    .then((reviews) => {
      res.send({ reviews });
    })
    .catch((err) => next(err));
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

exports.patchReview = (req, res, next) => {
  const { review_id } = req.params;
  const { inc_votes } = req.body;
  alterVotes(review_id, inc_votes)
    .then((review) => {
      res.send({ review });
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

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  removeComment(comment_id)
    .then(() => {
      res.status(204).end();
    })
    .catch((err) => next(err));
};
