import { expect, jest } from "@jest/globals";
import { createProductController } from "./productController";
import productModel from "../models/productModel";

jest.mock("../models/productModel.js");
jest.mock("slugify");

describe("Product Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      fields: {},
      files: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  describe("createProductController", () => {
    const LAPTOP_PRODUCT = {
      name: "Laptop",
      description: "A powerful laptop",
      price: 1499.99, 
      category: "66db427fdb0119d9234b27ed", 
      quantity: 30,
      shipping: true,
    };

    const LAPTOP_PHOTO = {
      path: "example-path",
      type: "image/jpeg",
      size: 1000
    };

    const EXPECTED_LAPTOP_WITHOUT_PHOTO = {
      name: "Laptop",
      description: "A powerful laptop",
      price: 1499.99, 
      category: "66db427fdb0119d9234b27ed", 
      quantity: 30,
      shipping: true
    };

    it("should successfully create a new product", async () => {
      req.fields = LAPTOP_PRODUCT;

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      const responseData = res.send.mock.calls[0][0];
      expect(responseData.success).toBeTruthy(); 
      expect(responseData.products).toMatchObject({ 
        ...EXPECTED_LAPTOP_WITHOUT_PHOTO,
        category: expect.any(Object)
      });
      expect(responseData.products.category.toString()).toBe(LAPTOP_PRODUCT.category);
    });

    it("should fail when no name is given", async () => {
      const { name, ...rest } = LAPTOP_PRODUCT;
      req.fields = rest;

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });
    });

    it("should fail when no description is given", async () => {
      const { description, ...rest } = LAPTOP_PRODUCT;
      req.fields = rest;

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: "Description is Required" });
    });

    it("should fail when no price is given", async () => {
      const { price, ...rest } = LAPTOP_PRODUCT;
      req.fields = rest;

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: "Price is Required" });
    });

    it("should fail when no category is given", async () => {
      const { category, ...rest } = LAPTOP_PRODUCT;
      req.fields = rest;

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: "Category is Required" });
    });

    it("should fail when no quantity is given", async () => {
      const { quantity, ...rest } = LAPTOP_PRODUCT;
      req.fields = rest;

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: "Quantity is Required" });
    });
  });
});