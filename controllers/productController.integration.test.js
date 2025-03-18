import { expect, jest } from "@jest/globals";
import request from "supertest";
import app from "../server";
import { clearTestDB, closeTestDB, connectTestDB, loadDummyData } from "../config/test-db";

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

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe("Product Controller Integration", () => {
  describe("createProductController integration", () => {
    beforeEach(async () => {
      await loadDummyData("products", [LAPTOP_PRODUCT, SMARTPHONE_PRODUCT, BOOK_PRODUCT]);
    });
    
    it("should get product successfully", async () => {
      const res = await request(app).get("/api/v1/product/get-product");
      console.log(res.body);
      expect(res.body.countTotal).toBe(3);
    });
  });
});