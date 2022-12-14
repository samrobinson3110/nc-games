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
  describe("Query tests", () => {
    test("200 : responds with reviews filtered by category", () => {
      return request(app)
        .get("/api/reviews?category=dexterity")
        .expect(200)
        .then((result) => {
          expect(result.body.reviews).toEqual(expect.any(Array));
          expect(result.body.reviews.length).toBeGreaterThan(0);
          result.body.reviews.forEach((review) => {
            expect(review).toMatchObject({
              category: "dexterity",
            });
          });
        });
    });
    test("200 : responds with reviews sorted by column", () => {
      return request(app)
        .get("/api/reviews?sort_by=votes")
        .expect(200)
        .then((result) => {
          expect(result.body.reviews).toEqual(expect.any(Array));
          expect(result.body.reviews.length).toBeGreaterThan(0);
          expect(result.body.reviews).toBeSortedBy("votes", {
            descending: true,
          });
        });
    });
    test("200 : responds with reviews ordered by order", () => {
      return request(app)
        .get("/api/reviews?order=asc")
        .expect(200)
        .then((result) => {
          expect(result.body.reviews).toEqual(expect.any(Array));
          expect(result.body.reviews.length).toBeGreaterThan(0);
          expect(result.body.reviews).toBeSortedBy("created_at");
        });
    });
    test("200 : responds with reviews following multiple queries", () => {
      return request(app)
        .get("/api/reviews?order=asc&sort_by=votes&category=social deduction")
        .expect(200)
        .then((result) => {
          expect(result.body.reviews).toEqual(expect.any(Array));
          expect(result.body.reviews.length).toBeGreaterThan(0);
          expect(result.body.reviews).toBeSortedBy("votes");
          result.body.reviews.forEach((review) => {
            expect(review).toMatchObject({
              category: "social deduction",
            });
          });
        });
    });
    test("400 : responds with an error if client tries to filter by a non-existent category", () => {
      return request(app)
        .get("/api/reviews?category=not_there")
        .expect(400)
        .then((result) => {
          expect(result.body.msg).toBe("Bad Request");
        });
    });
    test("200 : responds with reviews sorted by date if client tries to sort by a non-existent column", () => {
      return request(app)
        .get("/api/reviews?sort_by=not_there")
        .expect(200)
        .then((result) => {
          expect(result.body.reviews).toBeSortedBy("created_at", {
            descending: true,
          });
        });
    });
    test("200 : responds with reviews ordered by descending value if client tries to order by something other than asc/desc", () => {
      return request(app)
        .get("/api/reviews?order=not_there&sort_by=title")
        .expect(200)
        .then((result) => {
          expect(result.body.reviews).toBeSortedBy("title", {
            descending: true,
          });
        });
    });
    test("200 : responds with an empty array for a valid category with no reviews", () => {
      return request(app)
        .get("/api/reviews?category=children's games")
        .expect(200)
        .then((result) => {
          expect(result.body.reviews).toEqual([]);
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
  test("200 : response object contains comment_count = 0 when no comments exist", () => {
    return request(app)
      .get("/api/reviews/1")
      .expect(200)
      .then((result) => {
        expect(result.body.review).toMatchObject({
          review_id: 1,
          comment_count: 0,
        });
      });
  });
  test("200 : response object contains comment_count > 0 when comments exist", () => {
    return request(app)
      .get("/api/reviews/2")
      .expect(200)
      .then((result) => {
        expect(result.body.review).toMatchObject({
          review_id: 2,
          comment_count: 3,
        });
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

describe("PATCH /api/reviews/:review_id", () => {
  test("200 : responds with updated review object with votes increased", () => {
    const patchObject = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/reviews/2")
      .send(patchObject)
      .expect(200)
      .then((result) => {
        expect(result.body.review).toMatchObject({
          review_id: 2,
          title: "Jenga",
          review_body: "Fiddly fun for all the family",
          designer: "Leslie Scott",
          review_img_url:
            "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
          votes: 6,
          category: "dexterity",
          owner: "philippaclaire9",
          created_at: expect.stringMatching(isoPattern),
        });
      });
  });
  test("200 : responds with updated review object with votes decreased", () => {
    const patchObject = {
      inc_votes: -10,
    };
    return request(app)
      .patch("/api/reviews/2")
      .send(patchObject)
      .expect(200)
      .then((result) => {
        expect(result.body.review).toMatchObject({
          review_id: 2,
          title: "Jenga",
          review_body: "Fiddly fun for all the family",
          designer: "Leslie Scott",
          review_img_url:
            "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
          votes: -5,
          category: "dexterity",
          owner: "philippaclaire9",
          created_at: expect.stringMatching(isoPattern),
        });
      });
  });
  test("400 : responds with error when review_id is invalid", () => {
    const patchObject = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/reviews/two")
      .send(patchObject)
      .expect(400)
      .then((result) => {
        expect(result.body.msg).toBe("Bad Request");
      });
  });
  test("404 : responds with error when review_id is valid but non-existent", () => {
    const patchObject = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/reviews/9999")
      .send(patchObject)
      .expect(404)
      .then((result) => {
        expect(result.body.msg).toBe("Resource not found");
      });
  });
  test("400 : responds with error when input object has no inc_votes property", () => {
    const patchObject = {
      name: 1,
    };
    return request(app)
      .patch("/api/reviews/1")
      .send(patchObject)
      .expect(400)
      .then((result) => {
        expect(result.body.msg).toBe("Invalid patch object");
      });
  });
  test("400 : responds with error when inc_votes value is invalid", () => {
    const patchObject = {
      inc_votes: "one",
    };
    return request(app)
      .patch("/api/reviews/1")
      .send(patchObject)
      .expect(400)
      .then((result) => {
        expect(result.body.msg).toBe("Invalid patch object");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204 : responds with error containing no body", () => {
    return request(app)
      .delete("/api/comments/3")
      .expect(204)
      .then((result) => {
        expect(result.body).toEqual({});
      });
  });
  test("400 : responds with error for invalid comment_id", () => {
    return request(app)
      .delete("/api/comments/three")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad Request");
      });
  });
  test("404 : responds with error when comment_id does not exist", () => {
    return request(app)
      .delete("/api/comments/9999")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("comment_id not found");
      });
  });
});

describe("GET /api", () => {
  test("200 : responds with an object containing all available endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((result) => {
        expect(result.body).toMatchObject({
          "GET /api": expect.any(Object),
          "GET /api/categories": expect.any(Object),
          "GET /api/reviews": expect.any(Object),
          "GET /api/reviews/:review_id": expect.any(Object),
          "GET /api/reviews/:review_id/comments": expect.any(Object),
          "POST /api/reviews/:review_id/comments": expect.any(Object),
          "PATCH /api/reviews/:review_id": expect.any(Object),
          "GET /api/users": expect.any(Object),
          "DELETE /api/comments/:comment_id": expect.any(Object),
        });
      });
  });
});
