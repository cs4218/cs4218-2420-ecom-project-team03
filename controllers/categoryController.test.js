import { expect, jest } from "@jest/globals";
import categoryModel from "../models/categoryModel";
import slugify from "slugify";
import {
  updateCategoryController,
  categoryControlller,
  singleCategoryController,
  deleteCategoryController,
  createCategoryController,
} from "./categoryController";

jest.mock("../models/categoryModel.js");
jest.mock("slugify", () => jest.fn());

describe("Category Controller", () => {
  let req, res;
  const categories = [
    { name: "Category1", slug: "category1" },
    { name: "Category2", slug: "category2" },
  ];

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createCategoryController", () => {
    it("should successfully create a new category", async () => {
      req.body = { name: "new" };

      categoryModel.findOne = jest.fn().mockResolvedValue(null);

      categoryModel.prototype.save = jest.fn().mockResolvedValue({
        name: "new",
        slug: slugify("new"),
      });

      await createCategoryController(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "new category created",
        category: { name: "new", slug: slugify("new") },
      });
    });

    it("should create return status 200 if category already exists", async () => {
      req.body = { name: "already exists" };

      categoryModel.findOne = jest
        .fn()
        .mockResolvedValue({ name: "already exists" });

      categoryModel.prototype.save = jest.fn();

      await createCategoryController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Category Already Exists",
      });
    });

    it("should return status 401 if name is empty", async () => {
      await createCategoryController(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({ message: "Name is required" });
    });

    it("should handle any errors and return status 500", async () => {
      req.body.name = "new";
      let mockError = new Error("some error");
      categoryModel.findOne = jest.fn().mockRejectedValue(mockError);

      await createCategoryController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: mockError,
        message: "Error in Category",
      });
    });
  });

  describe("updateCategoryController", () => {
    it("should successfully update a category", async () => {
      req.body.name = "updated";
      req.params.id = "1";

      categoryModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
        name: "updated",
        slug: slugify("updated"),
      });

      await updateCategoryController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        messsage: "Category Updated Successfully",
        category: { name: "updated", slug: slugify("updated") },
      });
    });

    it("should handle any errors and return status 500", async () => {
      req.body.name = "updated";
      req.params.id = "1";
      let mockError = new Error("some error");

      categoryModel.findByIdAndUpdate = jest.fn().mockRejectedValue(mockError);

      await updateCategoryController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: mockError,
        message: "Error while updating category",
      });
    });
  });

  describe("get categoryControlller", () => {
    it("should successfully retrieve all categories", async () => {
      categoryModel.find = jest.fn().mockResolvedValue(categories);

      await categoryControlller(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "All Categories List",
        category: categories,
      });
    });

    it("should handle any errors and return status 500", async () => {
      let mockError = new Error("some error");
      categoryModel.find = jest.fn().mockRejectedValue(mockError);

      await categoryControlller(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error while getting all categories",
        error: mockError,
      });
    });
  });

  describe("singleCategoryController", () => {
    it("should successfully retrieve a single category", async () => {
      req.params.slug = categories[0].slug;
      categoryModel.findOne = jest.fn().mockResolvedValue(categories[0]);

      await singleCategoryController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Get Single Category Successfully",
        category: categories[0],
      });
    });

    it("should handle any errors and return status 500", async () => {
      req.params.slug = categories[0].slug;
      let mockError = new Error("some error");

      categoryModel.findOne = jest.fn().mockRejectedValue(mockError);

      await singleCategoryController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error While getting Single Category",
        error: mockError,
      });
    });
  });

  describe("deleteCategoryController", () => {
    it("should successfully delete a category", async () => {
      req.params.id = "1";
      categoryModel.findByIdAndDelete = jest.fn().mockResolvedValue();

      await deleteCategoryController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Category Deleted Successfully",
      });
    });

    it("should handle any errors and return status 500", async () => {
      req.params.id = "1";
      let mockError = new Error("some error");

      categoryModel.findByIdAndDelete = jest.fn().mockRejectedValue(mockError);

      await deleteCategoryController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error while deleting category",
        error: mockError,
      });
    });
  });
});
