const db = require("../db/connection");
const { checkExists } = require("../db/utils");
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

exports.selectReview = (review_id) => {
  return db
    .query(
      `
    SELECT * FROM reviews WHERE review_id = $1
    `,
      [review_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "review_id not found",
        });
      }
      return result.rows[0];
    });
};

exports.selectCommentsByReviewId = (review_id) => {
  return checkExists("reviews", "review_id", review_id)
    .then(() => {
      return db.query(
        `
  SELECT * FROM comments WHERE review_id = $1 ORDER BY created_at DESC;
    `,
        [review_id]
      );
    })
    .then((result) => {
      return result.rows;
    });
};
