const request = require("supertest");
const app = require("../app.js");
const connection = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data/index.js");

afterAll(() => {
  return connection.end();
});

beforeEach(() => {
  return seed(data);
});

const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

describe("GET /api/categories", () => {
  test("200 : responds with an array of category objects containing slug and description properties", () => {
    return request(app)
      .get("/api/categories")
      .expect(200)
      .then((result) => {
        expect(result.body.categories).toEqual(expect.any(Array));
        expect(result.body.categories.length).toBeGreaterThan(0);
        result.body.categories.forEach((category) => {
          expect(category).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/reviews", () => {
  test("200 : responds with an array of review objects containing correct properties", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then((result) => {
        expect(result.body.reviews).toEqual(expect.any(Array));
        expect(result.body.reviews.length).toBeGreaterThan(0);
        result.body.reviews.forEach((review) => {
          expect(review).toMatchObject({
            owner: expect.any(String),
            title: expect.any(String),
            review_id: expect.any(Number),
            category: expect.any(String),
            review_img_url: expect.any(String),
            created_at: expect.stringMatching(isoPattern),
            votes: expect.any(Number),
            designer: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test("200 : responds with the reviews sorted in descending date order", () => {
    return request(app)
      .get("/api/reviews")
      .expect(200)
      .then((result) => {
        expect(result.body.reviews).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
});

describe("GET /api/reviews/:review_id", () => {
  test("200 : responds with review object containing correct properties", () => {
    return request(app)
      .get("/api/reviews/2")
      .expect(200)
      .then((result) => {
        expect(result.body.review).toMatchObject({
          review_id: 2,
          title: "Jenga",
          review_body: "Fiddly fun for all the family",
          designer: "Leslie Scott",
          review_img_url:
            "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
          votes: 5,
          category: "dexterity",
          owner: "philippaclaire9",
          created_at: expect.stringMatching(isoPattern),
        });
      });
  });
  test("400 : responds with error when invalid review_id is input", () => {
    return request(app)
      .get("/api/reviews/one")
      .expect(400)
      .then((result) => {
        expect(result.body.msg).toBe("Bad Request");
      });
  });
  test("404 : responds with error when valid but non-existent review_id is input", () => {
    return request(app)
      .get("/api/reviews/9999")
      .expect(404)
      .then((result) => {
        expect(result.body.msg).toBe("review_id not found");
      });
  });
});

describe("GET /api/reviews/:review_id/comments", () => {
  test("200 : responds with array of comments with correct properties ", () => {
    return request(app)
      .get("/api/reviews/2/comments")
      .expect(200)
      .then((result) => {
        expect(result.body.comments).toEqual(expect.any(Array));
        expect(result.body.comments.length).toBeGreaterThan(0);
        result.body.comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            review_id: 2,
            created_at: expect.stringMatching(isoPattern),
            body: expect.any(String),
            author: expect.any(String),
          });
        });
      });
  });
  test("200 : responds with comments sorted by date descending", () => {
    return request(app)
      .get("/api/reviews/2/comments")
      .expect(200)
      .then((result) => {
        expect(result.body.comments).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
  test("200 : responds with empty array for review with no comments", () => {
    return request(app)
      .get("/api/reviews/1/comments")
      .expect(200)
      .then((result) => {
        expect(result.body.comments).toEqual([]);
      });
  });
  test("400 : responds with error when invalid review_id is input", () => {
    return request(app)
      .get("/api/reviews/one/comments")
      .expect(400)
      .then((result) => {
        expect(result.body.msg).toBe("Bad Request");
      });
  });
  test("404 : responds with error when valid but non-existent review_id is input ", () => {
    return request(app)
      .get("/api/reviews/9999/comments")
      .expect(404)
      .then((result) => {
        expect(result.body.msg).toBe("Resource not found");
      });
  });
});

describe("POST /api/reviews/:review_id/comments", () => {
  test("201 : responds with posted comment", () => {
    const newComment = {
      username: "mallionaire",
      body: "Very good game!",
    };
    return request(app)
      .post("/api/reviews/1/comments")
      .send(newComment)
      .expect(201)
      .then((result) => {
        expect(result.body.comment).toMatchObject({
          comment_id: expect.any(Number),
          author: "mallionaire",
          body: "Very good game!",
        });
      });
  });
  test("400 : responds with error when invalid review_id is input", () => {
    const newComment = {
      username: "mallionaire",
      body: "Very good game!",
    };
    return request(app)
      .post("/api/reviews/one/comments")
      .send(newComment)
      .expect(400)
      .then((result) => {
        expect(result.body.msg).toBe("Bad Request");
      });
  });
  test("404 : responds with error when valid but non-existent review_id input", () => {
    const newComment = {
      username: "mallionaire",
      body: "Very good game!",
    };
    return request(app)
      .post("/api/reviews/9999/comments")
      .send(newComment)
      .expect(404)
      .then((result) => {
        expect(result.body.msg).toBe("Resource not found");
      });
  });
  test("400 : responds with error when comment is incomplete (no body)", () => {
    let invalidComment = {
      username: "mallionaire",
    };
    return request(app)
      .post("/api/reviews/1/comments")
      .send(invalidComment)
      .expect(400)
      .then((result) => {
        expect(result.body.msg).toBe("Incomplete comment");
      });
  });
  test("400 : responds with error when comment is incomplete (no username)", () => {
    let invalidComment = {
      body: "This is a comment",
    };
    return request(app)
      .post("/api/reviews/1/comments")
      .send(invalidComment)
      .expect(400)
      .then((result) => {
        expect(result.body.msg).toBe("Incomplete comment");
      });
  });
  test("404 : responds with error when comment username is non-existent", () => {
    const newComment = {
      username: "non-existent",
      body: "Very good game!",
    };
    return request(app)
      .post("/api/reviews/1/comments")
      .send(newComment)
      .expect(404)
      .then((result) => {
        expect(result.body.msg).toBe("Resource not found");
      });
  });
});

describe("GET /api/users", () => {
  test("200 : responds with correct users object ", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((result) => {
        expect(result.body.users).toEqual(expect.any(Array));
        expect(result.body.users.length).toBeGreaterThan(0);
        result.body.users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});
