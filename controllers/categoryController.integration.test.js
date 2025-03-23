import { expect, jest } from "@jest/globals";
import request from "supertest";
import {
  clearTestDB,
  closeTestDB,
  connectTestDB,
  loadDummyData,
} from "../config/db";
import app from "../server";
import JWT from "jsonwebtoken";
import slugify from "slugify";
import productModel from "../models/productModel";

const ADMIN_USER = {
  _id: "67ab6a3bd0360ad8b53a1eeb",
  address: "123 Street",
  answer: "password123",
  email: "test@example.com",
  name: "John Doe",
  password: "password123",
  phone: "1234567890",
  role: 1,
};

const ELECTRONIC_CATEGORY = {
  _id: "66db427fdb0119d9234b27f3",
  name: "Electronic",
  slug: slugify("Electronic"),
};

const BOOK_CATEGORY = {
  _id: "66db427fdb0119d9234b27f1",
  name: "Book",
  slug: slugify("Book"),
};

const CATEGORIES = [
  { name: "category1", slug: slugify("category1") },
  { name: "category2", slug: slugify("category2") },
];

let token;

beforeAll(async () => {
  await connectTestDB();

  token = JWT.sign({ _id: ADMIN_USER._id }, process.env.JWT_SECRET, {
    expiresIn: "1m",
  });
});

beforeEach(async () => {
  await clearTestDB();
  await loadDummyData("categories", [ELECTRONIC_CATEGORY, BOOK_CATEGORY]);
  await loadDummyData("users", [ADMIN_USER]);
});

afterAll(async () => {
  await closeTestDB();
});

describe("Category Integration Tests", () => {
  describe("createCategoryController", () => {
    beforeAll(async () => {});

    beforeEach(async () => {});
    it("should successfully create a new category", async () => {
      const newCategory = CATEGORIES[0];

      const res = await request(app)
        .post("/api/v1/category/create-category")
        .send(newCategory)
        .set("Authorization", token);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("New Category Created");
      expect(res.body.message).toBe("New Category Created");
      expect(res.body.category).toHaveProperty("name", newCategory.name);
      expect(res.body.category).toHaveProperty("slug", newCategory.slug);
    });

    it("should not create a new category if the category name already exists", async () => {
      const existingCategory = BOOK_CATEGORY;
      const res = await request(app)
        .post("/api/v1/category/create-category")
        .send(existingCategory)
        .set("Authorization", token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Category Already Exists");
    });

    it("should return status 401 if name is empty", async () => {
      const newCategory = { name: "", slug: "" };

      const res = await request(app)
        .post("/api/v1/category/create-category")
        .send(newCategory)
        .set("Authorization", token);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe(
        "Category name cannot be empty or contain only whitespace"
      );
    });

    it("should return status 400 if name is only whitespace", async () => {
      const newCategory = { name: "  ", slug: slugify("  ") };

      const res = await request(app)
        .post("/api/v1/category/create-category")
        .send(newCategory)
        .set("Authorization", token);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe(
        "Category name cannot be empty or contain only whitespace"
      );
    });

    // it("should handle any errors and return status 500", async () => {

    // });
  });

  describe("updateCategoryController", () => {
    it("should successfully update a category", async () => {
      const res = await request(app)
        .put(`/api/v1/category/update-category/${ELECTRONIC_CATEGORY._id}`)
        .send({ name: "Updated" })
        .set("Authorization", token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Category Updated Successfully");
      expect(res.body.category.name).toBe("Updated");
    });

    it("should not update a category if new name already exists", async () => {
      const res = await request(app)
        .put(`/api/v1/category/update-category/${ELECTRONIC_CATEGORY._id}`)
        .send({ name: BOOK_CATEGORY.name })
        .set("Authorization", token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Category Already Exists");
    });

    it("should not update a category if new name is an empty string", async () => {
      const res = await request(app)
        .put(`/api/v1/category/update-category/${ELECTRONIC_CATEGORY._id}`)
        .send({ name: "" })
        .set("Authorization", token);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe(
        "Category name cannot be empty or contain only whitespace"
      );
    });

    it("should not update a category if new name is an empty string", async () => {
      const res = await request(app)
        .put(`/api/v1/category/update-category/${ELECTRONIC_CATEGORY._id}`)
        .send({ name: "  " })
        .set("Authorization", token);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe(
        "Category name cannot be empty or contain only whitespace"
      );
    });

    it("should handle any errors and return status 500", async () => {
      const res = await request(app)
        .put(`/api/v1/category/update-category/-1`)
        .send({ name: "Updated" })
        .set("Authorization", token);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Error while updating category");
    });
  });

  describe("get categoryControlller", () => {
    it("should successfully retrieve all categories", async () => {
      const res = await request(app).get("/api/v1/category/get-category");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("All Categories List");
      expect(res.body.category.length).toBe(2);
    });
  });

  describe("singleCategoryController", () => {
    it("should successfully retrieve a single category", async () => {
      const res = await request(app).get(
        `/api/v1/category/single-category/${ELECTRONIC_CATEGORY.slug}`
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.category.name).toBe(ELECTRONIC_CATEGORY.name);
      expect(res.body.message).toBe("Get Single Category Successfully");
    });

    it("should return 404 if category is not found", async () => {
      const res = await request(app).get(
        `/api/v1/category/single-category/${CATEGORIES[0].slug}`
      );
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Category not found");
    });
  });

  describe("deleteCategoryController", () => {
    it("should successfully delete a category", async () => {
      const res = await request(app)
        .delete(`/api/v1/category/delete-category/${ELECTRONIC_CATEGORY._id}`)
        .set("Authorization", token);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Category Deleted Successfully");
    });

    it("should handle any errors and return status 500", async () => {
      const res = await request(app)
        .delete(`/api/v1/category/delete-category/-1`)
        .set("Authorization", token);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Error while deleting category");
    });
  });
});
