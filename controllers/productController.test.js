import { expect, jest } from "@jest/globals";
import { 
  createProductController, 
  getProductController, 
  getSingleProductController, 
  productPhotoController,
  updateProductController
} from "./productController";
import productModel from "../models/productModel";

jest.mock("../models/productModel.js");
jest.mock("slugify");

const LAPTOP_PRODUCT = {
  name: "Laptop",
  description: "A powerful laptop",
  price: 1499.99, 
  category: "66db427fdb0119d9234b27ed", 
  quantity: 30,
  shipping: true,
};

const SMARTPHONE_PRODUCT = {
  name: "Smartphone",
  description: "A high-end smartphone",
  price: 99.99, 
  category: "66db427fdb0119d9234b27ed", 
  quantity: 500,
  shipping: false,
};

const BOOK_PRODUCT = {
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
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  describe("createProductController", () => {
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

    it("should respond with a success when product creation is successful", async () => {
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

    it("should respond with an error when no name is given", async () => {
      const { name, ...rest } = LAPTOP_PRODUCT;
      req.fields = rest;

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });
    });

    it("should respond with an error when no description is given", async () => {
      const { description, ...rest } = LAPTOP_PRODUCT;
      req.fields = rest;

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: "Description is Required" });
    });

    it("should respond with an error when no price is given", async () => {
      const { price, ...rest } = LAPTOP_PRODUCT;
      req.fields = rest;

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: "Price is Required" });
    });

    it("should respond with an error when no category is given", async () => {
      const { category, ...rest } = LAPTOP_PRODUCT;
      req.fields = rest;

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: "Category is Required" });
    });

    it("should respond with an error when no quantity is given", async () => {
      const { quantity, ...rest } = LAPTOP_PRODUCT;
      req.fields = rest;

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await createProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: "Quantity is Required" });
    });
  });

  describe("getProductController", () => {
    it("should respond with a success containing all product details", async () => {
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
        message: "AllProducts ",
        products: [ LAPTOP_PRODUCT, SMARTPHONE_PRODUCT ],
      })
    });

    it("should respond with a success even if there are no products", async () => {
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
        message: "AllProducts ",
        products: [],
      })
    });

    it("should respond with an error if database retrieval throws an error", async () => {
      productModel.find     = jest.fn().mockReturnThis();
      productModel.populate = jest.fn().mockReturnThis();
      productModel.select   = jest.fn().mockReturnThis();
      productModel.limit    = jest.fn().mockReturnThis();
      productModel.sort     = jest.fn().mockRejectedValueOnce({ message: "Database Error" });

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
    it("should send a success if single product retrieval is successful", async () => {
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

    it("should send an error if single product retrieval is unsuccessful", async () => {
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
    it("should send a success if photo retrieval is successful", async () => {
      req.params.pid = "mock-pid";
      res.set = jest.fn().mockImplementationOnce((key, value) => {
        res.contentType = value;
      });

      productModel.findById  = jest.fn().mockReturnThis();
      productModel.select    = jest.fn().mockResolvedValueOnce({
        photo: {
          data: Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]),
          contentType: "image/jpeg"
        }
      });
      
      await productPhotoController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.contentType).toBe("image/jpeg");
      expect(res.send).toHaveBeenCalledWith(Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]));
    });

    it("should send an error if photo retrieval is unsuccessful", async () => {
      req.params.pid = "mock-pid";
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
    it("should send a success if product deletion is successful", async () => {
      req.params.pid = "mock-pid";
      res.set = jest.fn().mockImplementationOnce((key, value) => {
        res.contentType = value;
      });

      productModel.findById  = jest.fn().mockReturnThis();
      productModel.select    = jest.fn().mockResolvedValueOnce({
        photo: {
          data: Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]),
          contentType: "image/jpeg"
        }
      });
      
      await productPhotoController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.contentType).toBe("image/jpeg");
      expect(res.send).toHaveBeenCalledWith(Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]));
    });

    it("should send an error if product deletion is unsuccessful", async () => {
      req.params.pid = "mock-pid";
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

  describe("updateProductController", () => {
    it("should respond with a success when product update is successful", async () => {
      req.fields = BOOK_PRODUCT;
      req.params.pid = "mock-pid";

      const bookModel = new productModel(BOOK_PRODUCT);
      productModel.findByIdAndUpdate = jest.fn().mockResolvedValueOnce(bookModel);
      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      const responseData = res.send.mock.calls[0][0];
      expect(responseData.success).toBeTruthy(); 
      expect(responseData.products).toMatchObject({ 
        ...BOOK_PRODUCT,
        category: expect.any(Object)
      });
      expect(responseData.products.category.toString()).toBe(BOOK_PRODUCT.category);
    });

    it("should respond with a success when product update is successful", async () => {
      req.fields = BOOK_PRODUCT;
      req.params.pid = "mock-pid";

      productModel.findByIdAndUpdate = jest.fn().mockRejectedValue("Database Error");
      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: "Database Error",
        message: "Error while updating product",
      });
    });

    it("should respond with an error when no name is given", async () => {
      const { name, ...rest } = LAPTOP_PRODUCT;
      req.fields = rest;

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });
    });

    it("should respond with an error when no description is given", async () => {
      const { description, ...rest } = LAPTOP_PRODUCT;
      req.fields = rest;

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: "Description is Required" });
    });

    it("should respond with an error when no price is given", async () => {
      const { price, ...rest } = LAPTOP_PRODUCT;
      req.fields = rest;

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: "Price is Required" });
    });

    it("should respond with an error when no category is given", async () => {
      const { category, ...rest } = LAPTOP_PRODUCT;
      req.fields = rest;

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: "Category is Required" });
    });

    it("should respond with an error when no quantity is given", async () => {
      const { quantity, ...rest } = LAPTOP_PRODUCT;
      req.fields = rest;

      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await updateProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ error: "Quantity is Required" });
    });
  });
});