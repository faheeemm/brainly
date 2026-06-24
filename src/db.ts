// create user models and schemas here
import mongoose, { model, Schema } from "mongoose";
import { mongoURL } from "./config.js";

try {
  await mongoose.connect(mongoURL);
  console.log("monghoose connected")
} catch (e) {
  console.log("santra cannot connect", e);
}


const UserSchema = new Schema({
  username: { type: String, unique: true },
  password: String
});

export const UserModel = model("User", UserSchema);
