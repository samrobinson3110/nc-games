const db = require("../db/connection");

exports.selectCategories = () => {
  return db.query("SELECT * FROM categories;").then((result) => {
    return result.rows;
  });
};

exports.selectReviews = () => {
  return db
    .query(
      `
      SELECT owner, reviews.review_id, title, category, designer, review_img_url, reviews.votes, reviews.created_at, CAST(COUNT(*) AS int) AS comment_count FROM reviews
      LEFT JOIN comments on reviews.review_id = comments.review_id
      GROUP BY reviews.review_id
      ORDER BY created_at DESC;
  `
    )
    .then((result) => {
      return result.rows;
    });
};
