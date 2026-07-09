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

const ContentSchema = new Schema({
  title: String,
  link: String,
  type: String,
  tags: [{ type: mongoose.Types.ObjectId, ref: 'Tag' }],
  userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true }
});

export const ContentModel = model("Content", ContentSchema);

const LinkSchema = new Schema({
  hash: { type: String, required: true, unique: true },
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true, unique: true },
});

export const LinkModel = model("Link", LinkSchema);