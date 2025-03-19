import mongoose from "mongoose";
import colors from "colors";
const connectDB = async () => {
    if (process.env.NODE_ENV == "test") {
        console.log("Test environment detected. Not opening actual database connection.")
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`Connected To Mongodb Database ${conn.connection.host}`.bgMagenta.white);
    } catch (error) {
        console.log(`Error in Mongodb ${error}`.bgRed.white);
    }
};

export default connectDB;