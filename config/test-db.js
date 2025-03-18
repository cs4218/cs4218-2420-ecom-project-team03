import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import slugify from "slugify";

let mongoServer;

export const connectTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri, {
    dbName: "test",
  });
};

export const closeTestDB = async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
};

export const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

export const loadDummyData = async (tblName, dummyData) => {
  for (const data of dummyData) {
    switch(tblName) {
      case "products":
        const product = new productModel({ ...data, slug: slugify(data.name) });
        await product.save();
        break;
      case "categories":
        const category = new categoryModel({ ...data, slug: slugify(data.name) });
        await category.save();
        break;
      case "orders":
        const order = new orderModel(data);
        await order.save();
        break;
      case "users":
        // TODO: Implement for userController
        break;
      default:
        console.error("invalid table name");
        break;
    }
  }
};