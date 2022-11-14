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
          title: expect.any(String),
          review_body: expect.any(String),
          designer: expect.any(String),
          review_img_url: expect.any(String),
          votes: expect.any(Number),
          category: expect.any(String),
          owner: expect.any(String),
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
