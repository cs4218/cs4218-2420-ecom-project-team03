import { expect, jest } from "@jest/globals";
import request from "supertest";
import { clearTestDB, closeTestDB, connectTestDB, loadDummyData } from "../config/test-db";
import app from "../server";
import JWT from "jsonwebtoken";
import slugify from "slugify";
import productModel from "../models/productModel";

const LAPTOP_PRODUCT = {
  _id: "66db427fdb0119d9234b27f3",
  name: "Laptop",
  description: "A powerful laptop",
  price: 1499.99, 
  category: "66db427fdb0119d9234b27ed", 
  quantity: 30,
  shipping: true,
};

const SMARTPHONE_PRODUCT = {
  _id: "66db427fdb0119d9234b27f5",
  name: "Smartphone",
  description: "A high-end smartphone",
  price: 99.99, 
  category: "66db427fdb0119d9234b27ed", 
  quantity: 500,
  shipping: false,
};

const BOOK_PRODUCT = {
  _id: "66db427fdb0119d9234b27f1",
  name: "Book",
  description: "A thick book",
  price: 10, 
  category: "66db427fdb0119d9234b27ef", 
  quantity: 1,
  shipping: false,
};

const ADMIN_USER = {
  _id: "67ab6a3bd0360ad8b53a1eeb",
  address: "123 Street",
  answer: "password123",
  email: "test@example.com",
  name: "John Doe",
  password: "password123",
  phone: "1234567890",
  role: 1
};

const ELECTRONIC_CATEGORY = {
  _id: LAPTOP_PRODUCT.category,
  name: "Electronic"
};

const BOOK_CATEGORY = {
  _id: BOOK_PRODUCT.category,
  name: "Book"
};

async function expectProductToExistAndMatch(id, expectedProduct) {
  try {
    const document = await productModel.findById(id);
    if (!document) {
      console.error(`Document with _id ${id} not found.`);
      return false;
    }

    for (const key of Object.keys(expectedProduct)) {
      if (key == "_id" || key == "category") continue;

      let match = false;
      if (key == "photo") {
        match = document[key]["contentType"] == expectedProduct[key]["contentType"]
          && document[key]["data"].equals(expectedProduct[key]["data"]);
      } else {
        match = document[key].toString() == expectedProduct[key].toString();
      }

      if (!match) {
        console.error(`Field mismatch. Expected ${expectedProduct[key]} but found ${document[key]}`)
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error("Error validating document:", error);
    return false;
  }
}

async function expectProductToNotExist(id) {
  try {
    const document = await productModel.findById(id);
    if (document) {
      console.error(`Document with _id ${id} found when it is not expected to be in the database.`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error validating document:", error);
    return false;
  }
}

async function isProductTableEmpty() {
  const count = await productModel.countDocuments();
  return count === 0;
};

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();
  await loadDummyData("categories", [ELECTRONIC_CATEGORY, BOOK_CATEGORY]);
});

afterAll(async () => {
  await closeTestDB();
});

describe("Product Controller Integration", () => {
  describe("Creating a Product", () => {
    let token;

    beforeAll(async () => {
      token = JWT.sign({ _id: ADMIN_USER._id }, process.env.JWT_SECRET, { expiresIn: "1m" });
    });

    beforeEach(async () => {
      await loadDummyData("users", [ADMIN_USER]);
    });

    it("should create and store product successfully", async () => {
      const res = await request(app)
        .post("/api/v1/product/create-product")
        .field("name", "Book")
        .field("description", "A thick book")
        .field("price", "10") 
        .field("category", "66db427fdb0119d9234b27ef") 
        .field("quantity", "1")
        .field("shipping", "false")
        .attach("photo", Buffer.from('a'.repeat(10)), {
          filename: "test.jpg",
          contentType: "image/jpeg"
        })
        .set("Authorization", token);

      expect(res.status).toBe(201);      
      expect(await expectProductToExistAndMatch(
        res.body.products._id, 
        { 
          ...BOOK_PRODUCT, 
          _id: res.body.products._id,  
          photo: { data: Buffer.from('a'.repeat(10)), contentType: "image/jpeg" } 
        }
      )).toBeTruthy();
    });

    it("should not create and store product if missing any required field", async () => {
      const res = await request(app)
        .post("/api/v1/product/create-product")
        .field("description", "A thick book")
        .field("price", "10") 
        .field("category", "66db427fdb0119d9234b27ef") 
        .field("quantity", "1")
        .field("shipping", "false")
        .attach("photo", Buffer.from('a'.repeat(10)), {
          filename: "test.jpg",
          contentType: "image/jpeg"
        })
        .set("Authorization", token);

      expect(res.status).toBe(400);      
      expect(await isProductTableEmpty()).toBeTruthy();
    });
  });

  describe("Updating a Product", () => {
    let token;

    beforeAll(async () => {
      token = JWT.sign({ _id: ADMIN_USER._id }, process.env.JWT_SECRET, { expiresIn: "1m" });
    });

    beforeEach(async () => {
      await loadDummyData("users", [ADMIN_USER]);
      await loadDummyData("products", [LAPTOP_PRODUCT, SMARTPHONE_PRODUCT, BOOK_PRODUCT]);
    });

    it("should update product successfully", async () => {
      const UPDATED_BOOK = {
        _id: BOOK_PRODUCT._id,
        name: "Book2",
        description: "A small book",
        price: 100, 
        category: "66db427fdb0119d9234b27ed", 
        quantity: 100,
        shipping: false,
        photo: {
          data: Buffer.from('c'.repeat(10)),
          contentType: "image/jpeg"
        }
      };
      const res = await request(app)
        .put(`/api/v1/product/update-product/${BOOK_PRODUCT._id}`)
        .field("name", UPDATED_BOOK.name)
        .field("description", UPDATED_BOOK.description)
        .field("price", UPDATED_BOOK.price) 
        .field("category", UPDATED_BOOK.category) 
        .field("quantity", UPDATED_BOOK.quantity)
        .field("shipping", UPDATED_BOOK.shipping)
        .attach("photo", Buffer.from('c'.repeat(10)), {
          filename: "test2.jpg",
          contentType: "image/jpeg"
        })
        .set("Authorization", token);

      expect(res.status).toBe(201);
      expect(await expectProductToExistAndMatch(BOOK_PRODUCT._id, BOOK_PRODUCT)).toBeFalsy();    
      expect(await expectProductToExistAndMatch(BOOK_PRODUCT._id, UPDATED_BOOK)).toBeTruthy();    
    });

    it("should not create and store product if missing any required field", async () => {
      
    });
  });

  describe("Retrieving Product Details", () => {
    beforeEach(async () => {
      await loadDummyData("products", [LAPTOP_PRODUCT, SMARTPHONE_PRODUCT, BOOK_PRODUCT]);
    });

    it("should fetch all products successfully", async () => {
      const res = await request(app)
        .get("/api/v1/product/get-product");

      expect(res.status).toBe(200);
      expect(res.body.countTotal).toBe(3);
    });

    it("should fetch no products if database is empty", async () => {
      await clearTestDB();
      const res = await request(app)
        .get("/api/v1/product/get-product");

      expect(res.status).toBe(200);
      expect(res.body.countTotal).toBe(0);
    });

    it("should fetch a single product successfully", async () => {
      const res = await request(app)
        .get(`/api/v1/product/get-product/${slugify(LAPTOP_PRODUCT.name)}`);
      
      expect(res.status).toBe(200);
      expect(res.body.product).toMatchObject({
        ...LAPTOP_PRODUCT,
        category: ELECTRONIC_CATEGORY
      });
    });

    it("should fetch no products if there is no product with the given slug", async () => {
      const res = await request(app)
        .get(`/api/v1/product/get-product/laptop`);
      
      expect(res.status).toBe(204);
    });

    it("should fetch a single product photo successfully", async () => {
      await clearTestDB();
      await loadDummyData("products", [{
        ...SMARTPHONE_PRODUCT,
        photo: {
          data: Buffer.from('a'.repeat(10)),
          contentType: "image/jpeg"
        }
      }]);
      const res = await request(app)
        .get(`/api/v1/product/product-photo/${SMARTPHONE_PRODUCT._id}`);
      
      expect(res.status).toBe(200);
      expect(res.body.equals(Buffer.from('a'.repeat(10)))).toBeTruthy();
    });

    it("should return a 500 if the given pid is malformed", async () => {
      const res = await request(app)
        .get("/api/v1/product/product-photo/12345678");
      
      expect(res.status).toBe(500);
    });

    it("should return a 404 if there is no product with the given pid", async () => {
      const res = await request(app)
        .get("/api/v1/product/product-photo/66db4271110119d9234b27f3");
      
      expect(res.status).toBe(404);
    });

    it("should fetch no product photo if the product has no photo stored", async () => {
      const res = await request(app)
        .get(`/api/v1/product/product-photo/${LAPTOP_PRODUCT._id}`);
      
      expect(res.status).toBe(204);
    });
  });
});