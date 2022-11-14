const { selectCategories, selectReviews } = require("../models/reviews.models");

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
