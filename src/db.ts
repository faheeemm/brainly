// create user models and schemas here
import mongoose, { model, Schema } from "mongoose";

mongoose.connect(process.env.MONGODB_URL!)

const UserSchema = new Schema({
  username: { type: String, unique: true },
  password: String
});

export const UserModel = model("User", UserSchema);
