import { expect, jest } from "@jest/globals";
import { 
  gateway,
  createProductController, 
  getProductController, 
  getSingleProductController, 
  deleteProductController,
  productCountController, 
  productFiltersController, 
  productListController, 
  productPhotoController,
  updateProductController,
  searchProductController,
  relatedProductController,
  productCategoryController,
  braintreeTokenController,
  brainTreePaymentController
} from "./productController";
import productModel from "../models/productModel";
import categoryModel from "../models/categoryModel";
import fs from "fs";
import mongoose from "mongoose";
import orderModel from "../models/orderModel";

jest.mock("../models/productModel.js");
jest.mock("../models/categoryModel.js");
jest.mock("../models/orderModel.js");
jest.mock("fs");

const LAPTOP_PRODUCT = {
  _id: "66db427fdb0119d9234b27f3",
  name: "Laptop",
  description: "A powerful laptop",
  price: 1499.99, 
  category: "66db427fdb0119d9234b27ed", 
  quantity: 30,
  shipping: true,
};

const UPDATED_LAPTOP_PRODUCT = {
  _id: "66db427fdb0119d9234b27f3",
  name: "Laptop 2",
  description: "A not so powerful laptop",
  price: 90, 
  category: "66db427fdb0119d9234b27ed", 
  quantity: 2,
  shipping: false,
};

const VALID_LAPTOP_PHOTO = {
  path: "example-path",
  type: "image/jpeg",
  size: 100
};

const INVALID_SIZE_LAPTOP_PHOTO = {
  path: "example-path",
  type: "image/jpeg",
  size: 1000001
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
      set: jest.fn(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  describe("createProductController", () => {
    it("should respond with a 201 when product creation is successful", async () => {
      req.fields = LAPTOP_PRODUCT;
      req.files = { photo: VALID_LAPTOP_PHOTO };

      const mockImageData = Buffer.from("mockimagedata");
      jest.spyOn(fs, "readFileSync").mockReturnValue(mockImageData);

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      const responseData = res.send.mock.calls[0][0];
      expect(responseData.success).toBeTruthy(); 
      const receivedProduct = responseData.products;
      // Partial match to ignore value of slug
      expect(receivedProduct).toMatchObject({
        ...LAPTOP_PRODUCT,
        _id: expect.any(mongoose.Types.ObjectId),
        category: expect.any(mongoose.Types.ObjectId),
      });
      expect(receivedProduct.photo.contentType).toBe(VALID_LAPTOP_PHOTO.type);
      expect(receivedProduct.photo.data.equals(mockImageData)).toBe(true);
      expect(receivedProduct.category.toString()).toBe(LAPTOP_PRODUCT.category);
    });

    it("should respond with a 201 when product is created with no photo", async () => {
      req.fields = LAPTOP_PRODUCT;

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      const responseData = res.send.mock.calls[0][0];
      expect(responseData.success).toBeTruthy(); 
      const receivedProduct = responseData.products;
      // Partial match to ignore value of slug
      expect(receivedProduct).toMatchObject({
        ...LAPTOP_PRODUCT,
        _id: expect.any(mongoose.Types.ObjectId),
        category: expect.any(mongoose.Types.ObjectId),
      });
      expect(receivedProduct.category.toString()).toBe(LAPTOP_PRODUCT.category);
    });

    it("should respond with a 400 when product photo is greater than 1mb", async () => {
      req.fields = LAPTOP_PRODUCT;
      req.files = { photo: INVALID_SIZE_LAPTOP_PHOTO };

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        error: "photo should be less then 1mb",
      });
    });

    it("should respond with a 500 when there is a database error", async () => {
      req.fields = LAPTOP_PRODUCT;
      req.files = { photo: VALID_LAPTOP_PHOTO };

      const mockImageData = Buffer.from("mockimagedata");
      jest.spyOn(fs, "readFileSync").mockReturnValue(mockImageData);

      productModel.prototype.save = jest.fn().mockRejectedValueOnce("Database Error");

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: "Database Error",
        message: "Error in creating product",
      });
    });

    it("should respond with a 400 when no name is given", async () => {
      const { name, ...rest } = LAPTOP_PRODUCT;
      req.fields = rest;

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ error: "Name is required" });
    });

    it("should respond with a 400 when no description is given", async () => {
      const { description, ...rest } = LAPTOP_PRODUCT;
      req.fields = rest;

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ error: "Description is required" });
    });

    it("should respond with a 400 when no price is given", async () => {
      const { price, ...rest } = LAPTOP_PRODUCT;
      req.fields = rest;

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ error: "Price is required" });
    });

    it("should respond with a 400 when given price is negative", async () => {
      req.fields = { ...LAPTOP_PRODUCT, price: -1 };

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ error: "Price should not be negative" });
    });

    it("should respond with a 400 when no category is given", async () => {
      const { category, ...rest } = LAPTOP_PRODUCT;
      req.fields = rest;

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ error: "Category is required" });
    });

    it("should respond with a 400 when no quantity is given", async () => {
      const { quantity, ...rest } = LAPTOP_PRODUCT;
      req.fields = rest;

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ error: "Quantity is required" });
    });

    it("should respond with a 400 when given quantity is negative", async () => {
      req.fields = { ...LAPTOP_PRODUCT, quantity: -1 };

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ error: "Quantity should not be negative" });
    });
  });

  describe("getProductController", () => {
    it("should respond with a 200 containing all product details", async () => {
      productModel.find     = jest.fn().mockReturnThis();
      productModel.populate = jest.fn().mockReturnThis();
      productModel.select   = jest.fn().mockReturnThis();
      productModel.limit    = jest.fn().mockReturnThis();
      productModel.sort     = jest.fn().mockResolvedValueOnce([ LAPTOP_PRODUCT, SMARTPHONE_PRODUCT ]);

      await getProductController(req, res);

      expect(res.status).toBeCalledWith(200)
      expect(res.send).toBeCalledWith({
        success: true,
        countTotal: 2,
        message: "All Products Fetched",
        products: [ LAPTOP_PRODUCT, SMARTPHONE_PRODUCT ],
      })
    });

    it("should respond with a 200 even when there are no products", async () => {
      productModel.find     = jest.fn().mockReturnThis();
      productModel.populate = jest.fn().mockReturnThis();
      productModel.select   = jest.fn().mockReturnThis();
      productModel.limit    = jest.fn().mockReturnThis();
      productModel.sort     = jest.fn().mockResolvedValueOnce([]);

      await getProductController(req, res);

      expect(res.status).toBeCalledWith(200)
      expect(res.send).toBeCalledWith({
        success: true,
        countTotal: 0,
        message: "All Products Fetched",
        products: [],
      })
    });

    it("should respond with a 500 when there is a database error", async () => {
      productModel.find     = jest.fn().mockReturnThis();
      productModel.populate = jest.fn().mockReturnThis();
      productModel.select   = jest.fn().mockReturnThis();
      productModel.limit    = jest.fn().mockReturnThis();
      productModel.sort     = jest.fn().mockRejectedValueOnce("Database Error");

      await getProductController(req, res);

      expect(res.status).toBeCalledWith(500);
      expect(res.send).toBeCalledWith({
        success: false,
        message: "Error in getting products",
        error: "Database Error",
      });
    });
  })

  describe("getSingleProductController", () => {
    it("should respond with a 200 when single product retrieval is successful", async () => {
      req.params.slug = "laptop";
      productModel.findOne  = jest.fn().mockReturnThis();
      productModel.select   = jest.fn().mockReturnThis();
      productModel.populate = jest.fn().mockResolvedValueOnce(LAPTOP_PRODUCT);
      
      await getSingleProductController(req, res);

      expect(productModel.findOne).toHaveBeenCalledWith({ slug: "laptop" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Single Product Fetched",
        product: LAPTOP_PRODUCT,
      });
    });

    it("should respond with a 500 when single product retrieval is unsuccessful", async () => {
      req.params.slug = "laptop";
      productModel.findOne  = jest.fn().mockReturnThis();
      productModel.select   = jest.fn().mockReturnThis();
      productModel.populate = jest.fn().mockRejectedValueOnce("Database Error");
      
      await getSingleProductController(req, res);

      expect(productModel.findOne).toHaveBeenCalledWith({ slug: "laptop" });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error while getting single product",
        error: "Database Error",
      });
    });
  });

  describe("productPhotoController", () => {
    it("should send a 200 when photo retrieval is successful", async () => {
      req.params.pid = LAPTOP_PRODUCT._id;
      res.set = jest.fn().mockImplementationOnce((key, value) => {
        res.contentType = value;
      });

      const mockImageData = Buffer.from("mock-image-data");
      productModel.findById = jest.fn().mockReturnThis();
      productModel.select = jest.fn().mockResolvedValueOnce({
        photo: {
          data: mockImageData,
          contentType: "image/jpeg"
        }
      });
      
      await productPhotoController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.contentType).toBe("image/jpeg");
      expect(res.send).toHaveBeenCalledWith(mockImageData);
    });

    it("should send a 404 when no product correlates to the pid given", async () => {
      req.params.pid = LAPTOP_PRODUCT._id;
      productModel.findById  = jest.fn().mockReturnThis();
      productModel.select = jest.fn().mockResolvedValueOnce(null);
      
      await productPhotoController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "No such product exists",
        error: "No such product exists"
      });
    });

    it("should send a 404 when malformed pid is given", async () => {
      req.params.pid = "invalid-pid";
      
      await productPhotoController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "No such product exists",
        error: "No such product exists"
      });
    });

    it("should send a 200 when there is no photo data for the pid given", async () => {
      req.params.pid = LAPTOP_PRODUCT._id;
  
      productModel.findById = jest.fn().mockReturnThis();
      productModel.select = jest.fn().mockResolvedValueOnce({
        photo: {
          data: null,
          contentType: "image/jpeg"
        }
      });
      
      await productPhotoController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith();
    });

    it("should send a 500 when photo retrieval is unsuccessful", async () => {
      req.params.pid = LAPTOP_PRODUCT._id;
      productModel.findById = jest.fn().mockReturnThis();
      productModel.select   = jest.fn().mockRejectedValueOnce("Database Error");
      
      await productPhotoController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error while getting photo",
        error: "Database Error",
      });
    });
  });

  describe("deleteProductController", () => {
    it("should respond with a 200 when product deletion is successful", async () => {
      const mock_pid = LAPTOP_PRODUCT._id;
      req.params.pid = mock_pid;

      productModel.findByIdAndDelete = jest.fn().mockReturnThis();
      productModel.select = jest.fn().mockResolvedValueOnce(LAPTOP_PRODUCT);
      
      await deleteProductController(req, res);

      expect(productModel.findByIdAndDelete).toHaveBeenCalledWith(mock_pid);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Product Deleted Successfully"
      });
    });

    it("should respond with a 404 if pid given is malformed", async () => {
      const mock_pid = "invalid-pid";
      req.params.pid = mock_pid;
      
      await deleteProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "No such product exists",
        error: "No such product exists"
      });
    });

    it("should respond with a 404 if no product with the given pid is found", async () => {
      const mock_pid = LAPTOP_PRODUCT._id;
      req.params.pid = mock_pid;

      productModel.findByIdAndDelete = jest.fn().mockReturnThis();
      productModel.select = jest.fn().mockResolvedValueOnce(null);
      
      await deleteProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "No such product exists",
        error: "No such product exists"
      });
    });

    it("should respond with a 500 when product deletion is unsuccessful", async () => {
      const mock_pid = LAPTOP_PRODUCT._id;
      req.params.pid = mock_pid;
      productModel.findByIdAndDelete = jest.fn().mockReturnThis();
      productModel.select = jest.fn().mockRejectedValueOnce("Database Error");
      
      await deleteProductController(req, res);

      expect(productModel.findByIdAndDelete).toHaveBeenCalledWith(mock_pid);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error while deleting product",
        error: "Database Error",
      });
    });
  });

  describe("updateProductController", () => {
    it("should respond with a 201 when product update is successful", async () => {
      req.fields = UPDATED_LAPTOP_PRODUCT;
      const mock_pid = UPDATED_LAPTOP_PRODUCT._id;
      req.params.pid = mock_pid;
      req.files = { photo: VALID_LAPTOP_PHOTO };

      const laptopModel = new productModel(UPDATED_LAPTOP_PRODUCT);
      // Return a productModel instance to ensure that save() can be called
      productModel.findByIdAndUpdate = jest.fn().mockResolvedValueOnce(laptopModel);
      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      const mockImageData = Buffer.from("mockimagedata");
      jest.spyOn(fs, "readFileSync").mockReturnValue(mockImageData);

      await updateProductController(req, res);

      expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mock_pid,
        { ...req.fields, slug: expect.any(String) },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(201);
      const responseData = res.send.mock.calls[0][0];
      expect(responseData.success).toBeTruthy(); 
      const receivedProduct = responseData.products;
      expect(receivedProduct).toMatchObject({
        ...UPDATED_LAPTOP_PRODUCT,
        _id: expect.any(mongoose.Types.ObjectId),
        category: expect.any(mongoose.Types.ObjectId)
      });
      expect(receivedProduct.photo.contentType).toBe(VALID_LAPTOP_PHOTO.type);
      expect(receivedProduct.photo.data.equals(mockImageData)).toBe(true);
      expect(receivedProduct.category.toString()).toBe(UPDATED_LAPTOP_PRODUCT.category);
    });

    it("should respond with a 201 when updating with no photo", async () => {
      req.fields = UPDATED_LAPTOP_PRODUCT;
      const mock_pid = UPDATED_LAPTOP_PRODUCT._id;
      req.params.pid = mock_pid;

      const laptopModel = new productModel(UPDATED_LAPTOP_PRODUCT);
      // Return a productModel instance to ensure that save() can be called
      productModel.findByIdAndUpdate = jest.fn().mockResolvedValueOnce(laptopModel);
      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await updateProductController(req, res);

      expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mock_pid,
        { ...req.fields, slug: expect.any(String) },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(201);
      const responseData = res.send.mock.calls[0][0];
      expect(responseData.success).toBeTruthy(); 
      const receivedProduct = responseData.products;
      expect(receivedProduct).toMatchObject({
        ...UPDATED_LAPTOP_PRODUCT,
        _id: expect.any(mongoose.Types.ObjectId),
        category: expect.any(mongoose.Types.ObjectId)
      });
      expect(receivedProduct.category.toString()).toBe(UPDATED_LAPTOP_PRODUCT.category);
    });

    it("should respond with a 400 when photo size exceeds 1mb", async () => {
      req.fields = UPDATED_LAPTOP_PRODUCT;
      const mock_pid = UPDATED_LAPTOP_PRODUCT._id;
      req.params.pid = mock_pid;
      req.files = { photo: INVALID_SIZE_LAPTOP_PHOTO };

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ error: "photo should be less then 1mb" });
    });

    it("should respond with a 404 if pid given is malformed", async () => {
      req.fields = UPDATED_LAPTOP_PRODUCT;
      const mock_pid = "invalid-pid";
      req.params.pid = mock_pid;

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "No such product exists",
        error: "No such product exists"
      });
    });

    it("should respond with a 404 if there is no product with the given pid to update", async () => {
      req.fields = UPDATED_LAPTOP_PRODUCT;
      const mock_pid = UPDATED_LAPTOP_PRODUCT._id;
      req.params.pid = mock_pid;

      productModel.findByIdAndUpdate = jest.fn().mockResolvedValueOnce(null);

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "No such product exists",
        error: "No such product exists"
      });
    });

    it("should respond with a 500 when there is a database error with the query", async () => {
      req.fields = LAPTOP_PRODUCT;
      req.params.pid = LAPTOP_PRODUCT._id;

      productModel.findByIdAndUpdate = jest.fn().mockRejectedValueOnce("Database Error");

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: "Database Error",
        message: "Error while updating product",
      });
    });

    it("should respond with a 500 when there is a database error with updating", async () => {
      req.fields = UPDATED_LAPTOP_PRODUCT;
      req.params.pid = UPDATED_LAPTOP_PRODUCT._id;

      const laptopModel = new productModel(UPDATED_LAPTOP_PRODUCT);
      productModel.findByIdAndUpdate = jest.fn().mockResolvedValueOnce(laptopModel);
      productModel.prototype.save = jest.fn().mockRejectedValueOnce("Database Error");

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: "Database Error",
        message: "Error while updating product",
      });
    });

    it("should respond with a 400 when no name is given", async () => {
      const { name, ...rest } = LAPTOP_PRODUCT;
      req.fields = rest;

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ error: "Name is required" });
    });

    it("should respond with a 400 when no description is given", async () => {
      const { description, ...rest } = LAPTOP_PRODUCT;
      req.fields = rest;

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ error: "Description is required" });
    });

    it("should respond with a 400 when no price is given", async () => {
      const { price, ...rest } = LAPTOP_PRODUCT;
      req.fields = rest;

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ error: "Price is required" });
    });

    it("should respond with a 400 when given price is negative", async () => {
      req.fields = { ...LAPTOP_PRODUCT, price: -1 };

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ error: "Price should not be negative" });
    });

    it("should respond with a 400 when no category is given", async () => {
      const { category, ...rest } = LAPTOP_PRODUCT;
      req.fields = rest;

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ error: "Category is required" });
    });

    it("should respond with a 400 when no quantity is given", async () => {
      const { quantity, ...rest } = LAPTOP_PRODUCT;
      req.fields = rest;

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ error: "Quantity is required" });
    });

    it("should respond with a 400 when given quantity is negative", async () => {
      req.fields = { ...LAPTOP_PRODUCT, quantity: -1 };

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ error: "Quantity should not be negative" });
    });
  });

  describe("productFiltersController", () => {
    it("should respond with a 200 when product filter by category and range is successful", async () => {
      req.body = {
        checked: "66db427fdb0119d9234b27ed",
        radio: [100, 200]
      }

      productModel.find   = jest.fn().mockReturnThis();
      productModel.select = jest.fn().mockResolvedValueOnce([ LAPTOP_PRODUCT, BOOK_PRODUCT ]);

      await productFiltersController(req, res);

      expect(productModel.find).toHaveBeenCalledWith({
        category: "66db427fdb0119d9234b27ed",
        price: { $gte: 100, $lte: 200 }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Filtered Products Fetched",
        products: [ LAPTOP_PRODUCT, BOOK_PRODUCT ],
      });
    });

    it("should respond with a 200 when product filter by category is successful", async () => {
      req.body = {
        checked: "66db427fdb0119d9234b27ed",
        radio: []
      }

      productModel.find   = jest.fn().mockReturnThis();
      productModel.select = jest.fn().mockResolvedValueOnce([ LAPTOP_PRODUCT, BOOK_PRODUCT ]);

      await productFiltersController(req, res);

      expect(productModel.find).toHaveBeenCalledWith({
        category: "66db427fdb0119d9234b27ed"
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Filtered Products Fetched",
        products: [ LAPTOP_PRODUCT, BOOK_PRODUCT ],
      });
    });

    it("should respond with a 200 when product filter by range is successful", async () => {
      req.body = {
        checked: "",
        radio: [100, 200]
      }

      productModel.find   = jest.fn().mockReturnThis();
      productModel.select = jest.fn().mockResolvedValueOnce([ LAPTOP_PRODUCT, BOOK_PRODUCT ]);

      await productFiltersController(req, res);

      expect(productModel.find).toHaveBeenCalledWith({
        price: { $gte: 100, $lte: 200 }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Filtered Products Fetched",
        products: [ LAPTOP_PRODUCT, BOOK_PRODUCT ],
      });
    });

    it("should respond with a 500 when product filter is unsuccessful", async () => {
      req.body = {
        checked: "66db427fdb0119d9234b27ed",
        radio: [100, 200]
      }
      productModel.find   = jest.fn().mockReturnThis();
      productModel.select = jest.fn().mockRejectedValueOnce("Database Error");

      await productFiltersController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error while filtering products",
        error: "Database Error",
      });
    });
  });

  describe("productCountController", () => {
    it("should respond with a 200 when product count is successful", async () => {
      productModel.find = jest.fn().mockReturnThis();
      productModel.estimatedDocumentCount = jest.fn().mockResolvedValueOnce(10);

      await productCountController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Product count successful",
        total: 10,
      });
    });

    it("should respond with a 500 when product count is unsuccessful", async () => {
      productModel.find = jest.fn().mockReturnThis();
      productModel.estimatedDocumentCount = jest.fn().mockRejectedValueOnce("Database Error");

      await productCountController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: "Error in product count",
        error: "Database Error",
        success: false,
      });
    });
  });

  describe("productListController", () => {
    const perPage = 6;
    it("should respond with a 200 when getting first page of products", async () => {
      req.params.page = 1;

      const PRODUCTS = [
        LAPTOP_PRODUCT, LAPTOP_PRODUCT, LAPTOP_PRODUCT, LAPTOP_PRODUCT, LAPTOP_PRODUCT, LAPTOP_PRODUCT
      ];
      productModel.find   = jest.fn().mockReturnThis();
      productModel.select = jest.fn().mockReturnThis();
      productModel.skip   = jest.fn().mockReturnThis();
      productModel.limit  = jest.fn().mockReturnThis();
      productModel.sort   = jest.fn().mockResolvedValueOnce(PRODUCTS);

      await productListController(req, res);

      expect(productModel.skip).toHaveBeenCalledWith(0);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Product list for page 1 successful",
        products: PRODUCTS,
      });
    });

    it("should respond with a 200 when getting second page of products", async () => {
      req.params.page = 2;

      const PRODUCTS = [
        SMARTPHONE_PRODUCT, SMARTPHONE_PRODUCT, SMARTPHONE_PRODUCT, SMARTPHONE_PRODUCT, SMARTPHONE_PRODUCT, SMARTPHONE_PRODUCT
      ];
      productModel.find   = jest.fn().mockReturnThis();
      productModel.select = jest.fn().mockReturnThis();
      productModel.skip   = jest.fn().mockReturnThis();
      productModel.limit  = jest.fn().mockReturnThis();
      productModel.sort   = jest.fn().mockResolvedValueOnce(PRODUCTS);

      await productListController(req, res);

      expect(productModel.skip).toHaveBeenCalledWith(1 * perPage);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Product list for page 2 successful",
        products: PRODUCTS,
      });
    });

    it("should respond with a 500 when product list is unsuccessful", async () => {
      req.params.page = 1;
      productModel.find   = jest.fn().mockReturnThis();
      productModel.select = jest.fn().mockReturnThis();
      productModel.skip   = jest.fn().mockReturnThis();
      productModel.limit  = jest.fn().mockReturnThis();
      productModel.sort   = jest.fn().mockRejectedValueOnce("Database Error");

      await productListController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error in per page ctrl",
        error: "Database Error",
      });
    });

    it("should respond with a 200 even when no page is specified", async () => {
      const PRODUCTS = [
        LAPTOP_PRODUCT, LAPTOP_PRODUCT, LAPTOP_PRODUCT, LAPTOP_PRODUCT, LAPTOP_PRODUCT, LAPTOP_PRODUCT
      ];
      productModel.find   = jest.fn().mockReturnThis();
      productModel.select = jest.fn().mockReturnThis();
      productModel.skip   = jest.fn().mockReturnThis();
      productModel.limit  = jest.fn().mockReturnThis();
      productModel.sort   = jest.fn().mockResolvedValueOnce(PRODUCTS);

      await productListController(req, res);

      expect(productModel.skip).toHaveBeenCalledWith(0);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Product list for page 1 successful",
        products: PRODUCTS,
      });
    });
  });

  describe("searchProductController", () => {
    it("should respond with a 200 when some products match keyword", async () => {
      const mock_keyword = "mock";
      req.params.keyword = mock_keyword;

      const matching_products = [LAPTOP_PRODUCT, SMARTPHONE_PRODUCT, BOOK_PRODUCT];
      
      productModel.find = jest.fn().mockReturnThis();
      productModel.select = jest.fn().mockResolvedValueOnce(matching_products);

      await searchProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(matching_products);
    });

    it("should respond with a 200 when no products match keyword", async () => {
      const mock_keyword = "mock";
      req.params.keyword = mock_keyword;

      const empty_products = [];
      
      productModel.find = jest.fn().mockReturnThis();
      productModel.select = jest.fn().mockResolvedValueOnce(empty_products);

      await searchProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(empty_products);
    });

    it("should respond with a 500 when search is unsuccessful", async () => {
      const mock_keyword = "mock";
      req.params.keyword = mock_keyword;
      
      productModel.find = jest.fn().mockReturnThis();
      productModel.select = jest.fn().mockRejectedValueOnce("Database Error");

      await searchProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error in search product API",
        error: "Database Error",
      });
    });
  });

  describe("relatedProductController", () => {
    it("should respond with a 200 when there are related products", async () => {
      const mock_pid = LAPTOP_PRODUCT._id;
      const mock_cid = LAPTOP_PRODUCT.category;
      req.params.pid = mock_pid;
      req.params.cid = mock_cid;

      const related_products = [SMARTPHONE_PRODUCT];

      productModel.find = jest.fn().mockReturnThis();
      productModel.select = jest.fn().mockReturnThis();
      productModel.limit = jest.fn().mockReturnThis();
      productModel.populate = jest.fn().mockResolvedValueOnce(related_products);

      await relatedProductController(req, res);

      expect(productModel.find).toHaveBeenCalledWith({
        category: mock_cid,
        _id: { $ne: mock_pid }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Related Products Fetched",
        products: related_products
      });
    });

    it("should respond with a 200 when there are no related products", async () => {
      const mock_pid = LAPTOP_PRODUCT._id;
      const mock_cid = LAPTOP_PRODUCT.category;
      req.params.pid = mock_pid;
      req.params.cid = mock_cid;

      const empty_products = [];

      productModel.find = jest.fn().mockReturnThis();
      productModel.select = jest.fn().mockReturnThis();
      productModel.limit = jest.fn().mockReturnThis();
      productModel.populate = jest.fn().mockResolvedValueOnce(empty_products);

      await relatedProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Related Products Fetched",
        products: empty_products
      });
    });

    it("should respond with a 404 if pid given is malformed", async () => {
      const mock_pid = "invalid-pid";
      const mock_cid = LAPTOP_PRODUCT.category;
      req.params.pid = mock_pid;
      req.params.cid = mock_cid;

      await relatedProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "No such product or category exists",
        error: "No such product or category exists"
      });
    });

    it("should respond with a 404 if cid given is malformed", async () => {
      const mock_pid = LAPTOP_PRODUCT._id;
      const mock_cid = "invalid-cid";
      req.params.pid = mock_pid;
      req.params.cid = mock_cid;

      await relatedProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "No such product or category exists",
        error: "No such product or category exists"
      });
    });

    it("should respond with a 500 when there is a database error", async () => {
      const mock_pid = LAPTOP_PRODUCT._id;
      const mock_cid = LAPTOP_PRODUCT.category;
      req.params.pid = mock_pid;
      req.params.cid = mock_cid;

      productModel.find = jest.fn().mockReturnThis();
      productModel.select = jest.fn().mockReturnThis();
      productModel.limit = jest.fn().mockReturnThis();
      productModel.populate = jest.fn().mockRejectedValueOnce("Database Error");

      await relatedProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error while getting related product",
        error: "Database Error"
      });
    });
  });

  describe("productCategoryController", () => {
    it("should respond with a 200 when there are products for the category", async () => {
      const mock_slug = "electronics";
      req.params.slug = mock_slug;

      const category = new categoryModel({
        _id: "66db427fdb0119d9234b27f3",
        name: "electronics",
        slug: "electronics"
      });
      const mock_products = [LAPTOP_PRODUCT, SMARTPHONE_PRODUCT];
      categoryModel.findOne = jest.fn().mockResolvedValueOnce(category);
      productModel.find = jest.fn().mockReturnThis();
      productModel.populate = jest.fn().mockResolvedValueOnce(mock_products);

      await productCategoryController(req, res);

      expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: mock_slug });
      expect(productModel.find).toHaveBeenCalledWith({ category });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Products Fetched Successfully",
        category: category,
        products: mock_products,
      });
    });

    it("should respond with a 200 when there are no products for the category", async () => {
      const mock_slug = "electronics";
      req.params.slug = mock_slug;

      const category = new categoryModel({
        _id: "66db427fdb0119d9234b27f3",
        name: "electronics",
        slug: "electronics"
      });
      const mock_products = [];
      categoryModel.findOne = jest.fn().mockResolvedValueOnce(category);
      productModel.find = jest.fn().mockReturnThis();
      productModel.populate = jest.fn().mockResolvedValueOnce(mock_products);

      await productCategoryController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Products Fetched Successfully",
        category: category,
        products: mock_products,
      });
    });

    it("should respond with a 404 when no category is found", async () => {
      const mock_slug = "electronics";
      req.params.slug = mock_slug;

      categoryModel.findOne = jest.fn().mockResolvedValueOnce(null);

      await productCategoryController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "No such category found",
        error: "No such category found"
      });
    });

    it("should respond with a 500 when there is a database error for the first query", async () => {
      const mock_slug = "electronics";
      req.params.slug = mock_slug;

      categoryModel.findOne = jest.fn().mockRejectedValueOnce("Database Error");

      await productCategoryController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: "Database Error",
        message: "Error while getting products",
      });
    });

    it("should respond with a 500 when there is a database error for the second query", async () => {
      const mock_slug = "electronics";
      req.params.slug = mock_slug;
      
      const category = new categoryModel({
        _id: "66db427fdb0119d9234b27f3",
        name: "electronics",
        slug: "electronics"
      });
      categoryModel.findOne = jest.fn().mockResolvedValueOnce(category);
      productModel.find = jest.fn().mockReturnThis();
      productModel.populate = jest.fn().mockRejectedValueOnce("Database Error");

      await productCategoryController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: "Database Error",
        message: "Error while getting products",
      });
    });
  });

  describe("braintreeTokenController", () => {
    it("should respond with a 200 with the client token", async () => {
      const mockClientToken = { clientToken: "mock-client-token", success: true };
      gateway.clientToken.generate = jest.fn().mockImplementation((_, callbackFn) => {
        callbackFn(null, mockClientToken);
      });

      await braintreeTokenController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(mockClientToken);
    });

    it("should respond with a 500 when generating a token produces an error", async () => {
      const mockError = "error-generating-token";
      gateway.clientToken.generate = jest.fn().mockImplementation((_, callbackFn) => {
        callbackFn(mockError, null);
      });

      await braintreeTokenController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(mockError);
    });
  });

  describe("brainTreePaymentController", () => {
    it("should respond with a 200 when payment is successful", async () => {
      const mockCart = [
        { name: "laptop", price: 20 },
        { name: "smartphone", price: 80.50 },
        { name: "book", price: 1000.01 }
      ];
      const mockNonce = "mock-nonce";
      const mockUserId = "mock-user-id";
      const mockSuccess = "payment-successful";
      req.body = { cart: mockCart, nonce: mockNonce };
      req.user = { _id: mockUserId };

      gateway.transaction.sale = jest.fn().mockImplementationOnce((details, callbackFn) => {
        callbackFn(null, mockSuccess);
      });
      orderModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await brainTreePaymentController(req, res);

      expect(gateway.transaction.sale.mock.calls[0][0]).toEqual({
        amount: 1100.51,
        paymentMethodNonce: mockNonce,
        options: {
          submitForSettlement: true,
        }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ ok: true });
    });

    it("should respond with a 500 when payment is unsuccessful", async () => {
      const mockCart = [
        { name: "laptop", price: 20 },
        { name: "smartphone", price: 80.50 },
        { name: "book", price: 1000.01 }
      ];
      const mockNonce = "mock-nonce";
      const mockUserId = "mock-user-id";
      const mockError = "payment-unsuccessful";
      req.body = { cart: mockCart, nonce: mockNonce };
      req.user = { _id: mockUserId };

      gateway.transaction.sale = jest.fn().mockImplementationOnce((details, callbackFn) => {
        callbackFn(mockError, null);
      });

      await brainTreePaymentController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(mockError);
    });

    it("should respond with a 500 when there is a database error", async () => {
      const mockCart = [
        { name: "laptop", price: 20 },
        { name: "smartphone", price: 80.50 },
        { name: "book", price: 1000.01 }
      ];
      const mockNonce = "mock-nonce";
      const mockUserId = "mock-user-id";
      const mockSuccess = "payment-successful";
      req.body = { cart: mockCart, nonce: mockNonce };
      req.user = { _id: mockUserId };

      gateway.transaction.sale = jest.fn().mockImplementationOnce((details, callbackFn) => {
        callbackFn(null, mockSuccess);
      });
      orderModel.prototype.save = jest.fn().mockRejectedValueOnce("Database Error");

      await brainTreePaymentController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Database Error");
    });
  });
});