import mongoose from "mongoose";
import config from "../DefaultConfig/config";

export const connectToDB = async () => {
  try {
    await mongoose.connect(config?.DATABASE_URL || "", {
      dbName: config?.DB_NAME,
    });
    console.log("connected to database");
  } catch (error) {
    console.log(error);
  }
};
