import mongoose from "mongoose";
import colors from "colors";
import { MongoMemoryServer } from 'mongodb-memory-server';
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import slugify from "slugify";
import { DUMMY_CATEGORIES, DUMMY_PRODUCTS, DUMMY_USERS } from "./dummyData.js";

let mongoServer = null;

const connectDB = async () => {
    if (process.env.NODE_ENV == "frontend-integration") {
        console.log("Test environment detected. Connecting to test DB.");
        await connectTestDB();
        await loadDummyData("products", DUMMY_PRODUCTS);
        await loadDummyData("categories", DUMMY_CATEGORIES);
        await loadDummyData("users", DUMMY_USERS);
        return;
    } else if (process.env.NODE_ENV == "backend-integration") {
        console.log("Test environment detected. Connection to actual database denied.");
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`Connected To Mongodb Database ${conn.connection.host}`.bgMagenta.white);
    } catch (error) {
        console.log(`Error in Mongodb ${error}`.bgRed.white);
    }
};

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
    mongoServer = null;
};

export const clearTestDB = async () => {
    if (mongoServer == null) return;
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
};

export const loadDummyData = async (tblName, dummyData) => {
    if (mongoServer == null) return;
    for (const data of dummyData) {
        switch(tblName) {
        case "products":
            const product = new productModel(data);
            await product.save();
            break;
        case "categories":
            const category = new categoryModel(data);
            await category.save();
            break;
        case "orders":
            const order = new orderModel(data);
            await order.save();
            break;
        case "users":
            const user = new userModel(data);
            await user.save();
            break;
        default:
            console.error("invalid table name");
            break;
        }
    }
};

export default connectDB;