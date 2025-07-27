import mongoose from "mongoose";

import "../models/bidModel.js";
import "../models/cityModel.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect (
            `${process.env.MONGODB_URI}`,
        );
        console.log("Connected to Database", `${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("Error", error);
        throw error;
    }
};

export default connectDB;
