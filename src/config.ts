import dotenv from "dotenv";
dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

if(!MONGO_URL) {
  throw new Error("Mongo URL is not defined.")
}

export const mongoURL: string = MONGO_URL;