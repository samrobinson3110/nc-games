const db = require("../db/connection");
const format = require("pg-format");
const { checkExists } = require("../db/utils");
exports.selectCategories = () => {
  return db.query("SELECT * FROM categories;").then((result) => {
    return result.rows;
  });
};

exports.selectReviews = (sort_by = "created_at", order = "desc", category) => {
  order = order.toUpperCase();
  if (order !== "ASC") {
    order = "DESC";
  }

  const getCategories = this.selectCategories();
  const getColumns = db
    .query(
      `SELECT *
  from INFORMATION_SCHEMA.COLUMNS
  where TABLE_NAME='reviews'`
    )
    .then((result) => {
      return result.rows;
    });

  return Promise.all([getCategories, getColumns]).then((values) => {
    const categories = values[0].map((value) => value.slug);
    const columns = values[1].map((value) => value.column_name);

    if (!columns.includes(sort_by)) {
      sort_by = "created_at";
    }

    let queryStr = `SELECT owner, reviews.review_id, title, category, designer, review_img_url, reviews.votes, reviews.created_at, CAST(COUNT(*) AS int) AS comment_count FROM reviews
      LEFT JOIN comments on reviews.review_id = comments.review_id`;

    if (category) {
      if (!categories.includes(category)) {
        return Promise.reject({
          status: 400,
          msg: "Bad Request",
        });
      }
      queryStr = format(`${queryStr} WHERE category = %L`, [category]);
    }

    queryStr = format(
      `${queryStr} GROUP BY reviews.review_id ORDER BY %I ${order};`,
      [sort_by]
    );

    return db.query(queryStr).then((result) => {
      return result.rows;
    });
  });
};

exports.selectReview = (review_id) => {
  return db
    .query(
      `
      SELECT reviews.owner, reviews.review_id, title, review_body, category, designer, review_img_url, reviews.votes, reviews.created_at, CAST(COUNT(comments.review_id) AS int) AS comment_count FROM reviews
      LEFT JOIN comments on reviews.review_id = comments.review_id
      WHERE reviews.review_id = $1
      GROUP BY reviews.review_id;
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

exports.insertComment = (review_id, username, body) => {
  if (!username || !body) {
    return Promise.reject({
      status: 400,
      msg: "Incomplete comment",
    });
  }
  return checkExists("reviews", "review_id", review_id)
    .then(() => {
      return checkExists("users", "username", username).then(() => {
        return db.query(
          `
            INSERT INTO comments
            (author, body, review_id)
            VALUES
            ($1, $2, $3)
            RETURNING *;
            `,
          [username, body, review_id]
        );
      });
    })
    .then((result) => {
      return result.rows[0];
    });
};

exports.selectUsers = () => {
  return db.query("SELECT * FROM USERS;").then((result) => {
    return result.rows;
  });
};

exports.alterVotes = (review_id, inc_votes) => {
  if (!inc_votes || !/^-?[0-9]*$/.test(inc_votes)) {
    return Promise.reject({
      status: 400,
      msg: "Invalid patch object",
    });
  }

  return checkExists("reviews", "review_id", review_id)
    .then(() => {
      return db.query(
        `
              UPDATE reviews SET votes = $1 + (SELECT votes FROM reviews WHERE review_id = $2)
              WHERE review_id = $2 
              RETURNING *;
          `,
        [inc_votes, review_id]
      );
    })
    .then((result) => {
      return result.rows[0];
    });
};
