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

describe("GET /api/categories", () => {
  test("200 : responds with an array of category objects containing slug and description properties", () => {
    return request(app)
      .get("/api/categories")
      .expect(200)
      .then((result) => {
        expect(result.body.categories).toEqual(expect.any(Array));
        result.body.categories.forEach((category) => {
          expect(category).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});
