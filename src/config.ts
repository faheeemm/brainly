import dotenv from "dotenv";
dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

if(!MONGO_URL) {
  throw new Error("Mongo URL is not defined.")
}

export const mongoURL: string = MONGO_URL;


const JWT_PASSWORD = process.env.JWT_PASSWORD;

if (!JWT_PASSWORD) {
  throw new Error("JWT password is not defined.");
}

export const JWT_PASS: string = JWT_PASSWORD;

