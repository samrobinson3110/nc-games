const { selectCategories } = require("../models/reviews.models");

exports.getCategories = (req, res, next) => {
  selectCategories().then((categories) => {
    res.send({ categories });
  });
};
