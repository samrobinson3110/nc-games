const {
  selectCategories,
  selectReviews,
  selectReview,
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
