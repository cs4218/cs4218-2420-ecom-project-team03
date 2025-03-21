import { expect, jest } from "@jest/globals";
import request from "supertest";
import { clearTestDB, closeTestDB, connectTestDB, loadDummyData } from "../config/db";
import app from "../server";
import JWT from "jsonwebtoken";
import slugify from "slugify";
import mongoose from "mongoose";
import productModel from "../models/productModel";

const LAPTOP_PRODUCT = {
  _id: "66db427fdb0119d9234b27f3",
  name: "Laptop",
  slug: "Laptop",
  description: "A powerful laptop",
  price: 1499.99, 
  category: "66db427fdb0119d9234b27ed", 
  quantity: 30,
  shipping: true,
};

const SMARTPHONE_PRODUCT = {
  _id: "66db427fdb0119d9234b27f5",
  name: "Smartphone",
  slug: "Smartphone",
  description: "A high-end smartphone",
  price: 99.99, 
  category: "66db427fdb0119d9234b27ed", 
  quantity: 500,
  shipping: false,
};

const BOOK_PRODUCT = {
  _id: "66db427fdb0119d9234b27f1",
  name: "Book",
  slug: "Book",
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
  name: "Electronic",
  slug: "electronic"
};

const BOOK_CATEGORY = {
  _id: BOOK_PRODUCT.category,
  name: "Book",
  slug: "book"
};

async function expectProductToExistAndMatch(id, expectedProduct) {
  try {
    const document = await productModel.findById(id);
    if (!document) {
      console.log(`Document with _id ${id} not found.`);
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
        .field("name", BOOK_PRODUCT.name)
        .field("description", BOOK_PRODUCT.description)
        .field("price", BOOK_PRODUCT.price) 
        .field("category", BOOK_PRODUCT.category) 
        .field("quantity", BOOK_PRODUCT.quantity)
        .field("shipping", BOOK_PRODUCT.shipping)
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

    beforeAll(async () => {
      token = JWT.sign({ _id: ADMIN_USER._id }, process.env.JWT_SECRET, { expiresIn: "1m" });
    });

    beforeEach(async () => {
      await loadDummyData("users", [ADMIN_USER]);
      await loadDummyData("products", [LAPTOP_PRODUCT, SMARTPHONE_PRODUCT, BOOK_PRODUCT]);
    });

    it("should update product successfully", async () => {
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

    it("should not update product if missing any required field", async () => {
      const res = await request(app)
        .put(`/api/v1/product/update-product/${BOOK_PRODUCT._id}`)
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

      expect(res.status).toBe(400);
      expect(await expectProductToExistAndMatch(BOOK_PRODUCT._id, BOOK_PRODUCT)).toBeTruthy();    
      expect(await expectProductToExistAndMatch(BOOK_PRODUCT._id, UPDATED_BOOK)).toBeFalsy(); 
    });
  });

  describe("Deleting a Product", () => {
    beforeEach(async () => {
      await loadDummyData("products", [LAPTOP_PRODUCT, SMARTPHONE_PRODUCT, BOOK_PRODUCT]);
    });

    it("should delete product successfully", async () => {
      const res = await request(app)
        .delete(`/api/v1/product/delete-product/${BOOK_PRODUCT._id}`);

      expect(res.status).toBe(200);
      expect(await expectProductToNotExist(BOOK_PRODUCT._id)).toBeTruthy();  
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
  });

  describe("Retrieving a Single Product", () => {
    beforeEach(async () => {
      await loadDummyData("products", [LAPTOP_PRODUCT, SMARTPHONE_PRODUCT, BOOK_PRODUCT]);
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
      
      expect(res.status).toBe(404);
    });
  });

  describe("Retrieving Product Photo", () => {
    beforeEach(async () => {
      await loadDummyData("products", [LAPTOP_PRODUCT, SMARTPHONE_PRODUCT, BOOK_PRODUCT]);
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

    it("should return nothing if the product has no photo stored", async () => {
      const res = await request(app)
        .get(`/api/v1/product/product-photo/${LAPTOP_PRODUCT._id}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toEqual({});
    });
  });

  describe("Filtering Products", () => {
    beforeEach(async () => {
      await loadDummyData("products", [LAPTOP_PRODUCT, SMARTPHONE_PRODUCT, BOOK_PRODUCT]);
    });

    it("should filter products by category and price successfully", async () => {
      const res = await request(app)
        .post(`/api/v1/product/product-filters`)
        .send({ 
          checked: [ELECTRONIC_CATEGORY._id],
          radio: [100, 1500] 
        });

        expect(res.status).toBe(200);
        expect(res.body.products).toHaveLength(1);
        expect(res.body.products).toMatchObject([LAPTOP_PRODUCT]);
    });

    it("should filter products by category successfully", async () => {
      const res = await request(app)
        .post(`/api/v1/product/product-filters`)
        .send({ 
          checked: [ELECTRONIC_CATEGORY._id],
        });

        expect(res.status).toBe(200);
        expect(res.body.products).toHaveLength(2);
        expect(res.body.products).toMatchObject([LAPTOP_PRODUCT, SMARTPHONE_PRODUCT]);
    });

    it("should filter products by price successfully", async () => {
      const res = await request(app)
        .post(`/api/v1/product/product-filters`)
        .send({ 
          radio: [9.99, 100],
        });

        expect(res.status).toBe(200);
        expect(res.body.products).toHaveLength(2);
        expect(res.body.products).toMatchObject([SMARTPHONE_PRODUCT, BOOK_PRODUCT]);
    });

    it("should retrieve all products if no filter is given", async () => {
      const res = await request(app)
        .post(`/api/v1/product/product-filters`);

        expect(res.status).toBe(200);
        expect(res.body.products).toMatchObject([LAPTOP_PRODUCT, SMARTPHONE_PRODUCT, BOOK_PRODUCT]);
    });
  });

  describe("Counting Products", () => {
    beforeEach(async () => {
      await loadDummyData("products", [LAPTOP_PRODUCT, SMARTPHONE_PRODUCT, BOOK_PRODUCT]);
    });

    it("should count all products in database successfully", async () => {
      const res = await request(app)
        .get(`/api/v1/product/product-count`);

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(3);
    });
  });

  describe("Listing Products", () => {
    const PAGE_SIZE = 6;

    const dummyProducts = [];
    for (let i = 0; i < PAGE_SIZE * 3; i++) {
      dummyProducts.push({
        ...LAPTOP_PRODUCT,
        _id: (new mongoose.Types.ObjectId()).toString(),
        createdAt: (new Date(Date.now() + i * 60 * 1000)).toISOString(),
        updatedAt: (new Date(Date.now() + i * 60 * 1000)).toISOString(),
      })
    }

    beforeEach(async () => {
      await loadDummyData("products", dummyProducts);
    });

    it("should list all products in first page successfully", async () => {
      const res = await request(app)
        .get(`/api/v1/product/product-list/1`);
      
      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(PAGE_SIZE);
      expect(res.body.products).toMatchObject([...dummyProducts].reverse().slice(0, PAGE_SIZE));
    });

    it("should list all products in second page successfully", async () => {
      const res = await request(app)
        .get(`/api/v1/product/product-list/2`);
      
      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(PAGE_SIZE);
      expect(res.body.products).toMatchObject([...dummyProducts].reverse().slice(PAGE_SIZE, 2 * PAGE_SIZE));
    });
  });

  describe("Searching Products using Keyword", () => {
    const LAPTOP_2 = {
      ...LAPTOP_PRODUCT,
      _id: (new mongoose.Types.ObjectId()).toString(),
    };

    beforeEach(async () => {
      await loadDummyData("products", [LAPTOP_PRODUCT, SMARTPHONE_PRODUCT, BOOK_PRODUCT, LAPTOP_2]);
    });

    it("should find products that match keyword successfully", async () => {
      const singleMatchRes = await request(app)
        .get(`/api/v1/product/search/SMartpHone`);

      const multipleMatchRes = await request(app)
        .get(`/api/v1/product/search/Laptop`);
      
      expect(singleMatchRes.status).toBe(200);
      expect(singleMatchRes.body).toHaveLength(1);
      expect(singleMatchRes.body).toMatchObject([SMARTPHONE_PRODUCT]);

      expect(multipleMatchRes.status).toBe(200);
      expect(multipleMatchRes.body).toHaveLength(2);
      expect(multipleMatchRes.body).toMatchObject([LAPTOP_PRODUCT, LAPTOP_2]);
    });

    it("should return nothing if no products match keyword", async () => {
      const res = await request(app)
        .get(`/api/v1/product/search/dummy`);
    
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe("Related Products", () => {
    const dummyProducts = [LAPTOP_PRODUCT, SMARTPHONE_PRODUCT, BOOK_PRODUCT];
    for (let i = 0; i < 4; i++) {
      dummyProducts.push({
        ...LAPTOP_PRODUCT, 
        _id: (new mongoose.Types.ObjectId()).toString(),
      })
    }

    beforeEach(async () => {
      await loadDummyData("products", dummyProducts);
    });

    it("should find related products successfully", async () => {
      const res = await request(app)
        .get(`/api/v1/product/related-product/${LAPTOP_PRODUCT._id}/${LAPTOP_PRODUCT.category}`);

      const expectedProducts = [{ ...SMARTPHONE_PRODUCT, category: ELECTRONIC_CATEGORY }];
      for (const product of dummyProducts.slice(3, 5)) {
        expectedProducts.push({ ...product, category: ELECTRONIC_CATEGORY });
      }

      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(3);
      expect(res.body.products).toMatchObject(expectedProducts);
    });

    it("should return nothing if there are no related products", async () => {
      const res = await request(app)
      .get(`/api/v1/product/related-product/${BOOK_PRODUCT._id}/${BOOK_PRODUCT.category}`);

      expect(res.status).toBe(200);
      expect(res.body.products).toEqual([]);
    });
  });

  describe("Retrieving Products by Category", () => {
    beforeEach(async () => {
      await loadDummyData("products", [LAPTOP_PRODUCT, SMARTPHONE_PRODUCT, BOOK_PRODUCT]);
      await loadDummyData("categories", [{ 
        _id: (new mongoose.Types.ObjectId()).toString(), 
        name: "dummy", 
        slug: slugify("dummy") }]
      );
    });

    it("should find products with the given category successfully", async () => {
      const res = await request(app)
        .get(`/api/v1/product/product-category/${slugify(ELECTRONIC_CATEGORY.name)}`);

      const expectedProducts = [
        { ...LAPTOP_PRODUCT, category: ELECTRONIC_CATEGORY }, 
        { ...SMARTPHONE_PRODUCT, category: ELECTRONIC_CATEGORY }, 
      ];
      
      expect(res.status).toBe(200);
      expect(res.body.products).toMatchObject(expectedProducts);
    });

    it("should return nothing if there are no products with the given category", async () => {
      const res = await request(app)
        .get(`/api/v1/product/product-category/${slugify("dummy")}`);

      expect(res.status).toBe(200);
      expect(res.body.products).toEqual([]);
    });
  });
});