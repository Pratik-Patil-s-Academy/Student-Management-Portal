import mongoose from "mongoose";
import config from "./index.js";
import logger from "../utils/logger.js";

const connectDb = async () => {
    try {
        await mongoose.connect(config.mongoUri, {
            dbName: config.dbName,
        });

        logger.info("MongoDB connected successfully");
        console.log("connected");

    } catch (error) {
        logger.error(`MongoDB connection failed: ${error.message}`);
        console.log(error);
        process.exit(1);
    }
};

export default connectDb;