import { expect, jest } from "@jest/globals";
import { 
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
  relatedProductController
} from "./productController";
import productModel from "../models/productModel";

jest.mock("../models/productModel.js");
// jest.mock("slugify");

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
      const mock_pid = LAPTOP_PRODUCT._id;
      req.params.pid = mock_pid;

      productModel.findByIdAndDelete = jest.fn().mockReturnThis();
      productModel.select = jest.fn().mockResolvedValueOnce(null);
      
      await deleteProductController(req, res);

      expect(productModel.findByIdAndDelete).toHaveBeenCalledWith(mock_pid);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Product Deleted Successfully"
      });
    });

    it("should send an error if product deletion is unsuccessful", async () => {
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
    it("should respond with a success when product update is successful", async () => {
      req.fields = BOOK_PRODUCT;
      const mock_pid = BOOK_PRODUCT._id;
      req.params.pid = mock_pid;

      const bookModel = new productModel(BOOK_PRODUCT);
      productModel.findByIdAndUpdate = jest.fn().mockResolvedValueOnce(bookModel);
      productModel.prototype.save = jest.fn().mockResolvedValueOnce();

      await updateProductController(req, res);

      // expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
      //   mock_pid,
      //   { ...req.fields, ??? }
      //   { new: true }
      // );
      expect(res.status).toHaveBeenCalledWith(201);
      const responseData = res.send.mock.calls[0][0];
      expect(responseData.success).toBeTruthy(); 
      expect(responseData.products).toMatchObject(bookModel);
    });

    it("should respond with a success when product update is unsuccessful", async () => {
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

  describe("productFiltersController", () => {
    it("should respond with a success when product filter by category and range is successful", async () => {
      req.body = {
        checked: "66db427fdb0119d9234b27ed",
        radio: [100, 200]
      }

      productModel.find = jest.fn().mockResolvedValueOnce([ LAPTOP_PRODUCT, BOOK_PRODUCT ]);

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

    it("should respond with a success when product filter by category is successful", async () => {
      req.body = {
        checked: "66db427fdb0119d9234b27ed",
        radio: []
      }

      productModel.find = jest.fn().mockResolvedValueOnce([ LAPTOP_PRODUCT, BOOK_PRODUCT ]);

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

    it("should respond with a success when product filter by range is successful", async () => {
      req.body = {
        checked: "",
        radio: [100, 200]
      }

      productModel.find = jest.fn().mockResolvedValueOnce([ LAPTOP_PRODUCT, BOOK_PRODUCT ]);

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

    it("should respond with an error when product filter is unsuccessful", async () => {
      req.body = {
        checked: "66db427fdb0119d9234b27ed",
        radio: [100, 200]
      }

      productModel.find = jest.fn().mockRejectedValueOnce("Database Error");

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
    it("should respond with a success when product count is successful", async () => {
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

    it("should respond with an error when product count is unsuccessful", async () => {
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
    it("should respond with a success when getting first page of products", async () => {
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

    it("should respond with a success when getting second page of products", async () => {
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

    it("should respond with an error when product list is unsuccessful", async () => {
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
  });

  describe("searchProductController", () => {
    it("should respond with a success if some products match keyword", async () => {
      const mock_keyword = "mock";
      req.params.keyword = mock_keyword;

      const matching_products = [LAPTOP_PRODUCT, SMARTPHONE_PRODUCT, BOOK_PRODUCT];
      
      productModel.find = jest.fn().mockReturnThis();
      productModel.select = jest.fn().mockResolvedValueOnce(matching_products);

      await searchProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(matching_products);
    });

    it("should respond with a success if no products match keyword", async () => {
      const mock_keyword = "mock";
      req.params.keyword = mock_keyword;

      const empty_products = [];
      
      productModel.find = jest.fn().mockReturnThis();
      productModel.select = jest.fn().mockResolvedValueOnce(empty_products);

      await searchProductController(req, res);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith(empty_products);
    });

    it("should respond with an error if search is unsuccessful", async () => {
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
    it("should respond with a 200 if there are related products", async () => {
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

    it("should respond with a 204 if there are no related products", async () => {
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

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "No Related Products Found",
        products: empty_products
      });
    });

    it("should respond with a 500 if there is a database error", async () => {
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
});