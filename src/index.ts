import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import bcrypt from "bcrypt";
import { ContentModel, LinkModel, UserModel } from "./db.js";
import { JWT_PASS } from "./config.js";
import { userMiddleware } from "./middleware.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const SALT_ROUNDS = 10;

const signupSchema = z.object({
  username: z.string().min(3).max(30),
  password: z
    .string()
    .min(8)
    .max(64)
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

app.post("/api/v1/signup", async (req, res) => {
  // TODO1: Add Zod Validation
  const parsed = signupSchema.safeParse(req.body);
 
  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation failed!",
      errors: z.flattenError(parsed.error).fieldErrors,
    });
  }

  const { username, password } = parsed.data;
  
  try {
    // TODO2: Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    await UserModel.create({ username, password: hashedPassword });
    res.json({ message: "User signed up!" });
  } catch (e) {
    res.status(409).send({ message: "User already exists!" });
  }
});

app.post("/api/v1/signin", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const existingUser = await UserModel.findOne({ username });

  if (!existingUser) {
    return res.status(403).json({ message: "Invalid Creds!" });
  }

  const isValid = await bcrypt.compare(password, existingUser.password as string);
  if (!isValid) {
    return res.status(403).json({ message: "Invalid Creds!" });
  }
  
  const token = jwt.sign({ id: existingUser._id }, JWT_PASS);
  
  res.json({ token });
});

app.post("/api/v1/content", userMiddleware, async (req, res) => {
  const { title, link } = req.body;

  await ContentModel.create({
    title,
    link,
    // type,
    userId: req.userId,
    tags: [],
  });

  // console.log("post request: ", req.userId);
  res.json({ message: "content added" });
});

app.get("/api/v1/content", userMiddleware, async (req, res) => {
  // const userId = req.query.userId;
  const userId = req.userId;
  try {
    //@ts-ignore
    const content = await ContentModel.find({ userId }).populate(
      "userId",
      "username",
    );
    res.json({ content });
  } catch (e) {
    return e;
  }
  // console.log("get request: ", req.query.userId);
});

app.delete("/api/v1/content", userMiddleware, async (req, res) => {
  const contentId = req.body.contentId;

  await ContentModel.deleteMany({
    _id: new mongoose.Types.ObjectId(contentId),
    userId: new mongoose.Types.ObjectId(req.userId),
  });

  res.json({ message: "Deleted!" });
});

app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
  const { share } = req.body; // share: true → generate link, false → revoke

  if (share) {
    // Check if a link already exists for this user
    const existing = await LinkModel.findOne({ userId: req.userId });

    if (existing) {
      return res.json({ shareLink: existing.hash });
    }

    const hash = uuidv4();
    await LinkModel.create({ userId: req.userId, hash });
    res.json({ shareLink: hash });
  } else {
    await LinkModel.deleteOne({ userId: req.userId });
    res.json({ message: "Sharing disabled" });
  }
});

app.get("/api/v1/brain/:shareLink", async (req, res) => {
  const { shareLink } = req.params;

  try {
    const link = await LinkModel.findOne({ hash: shareLink });

    if (!link) {
      return res.status(404).json({ message: "Invalid share link" });
    }

    const content = await ContentModel.find({ userId: link.userId }).populate(
      "userId",
      "username",
    );

    const user = await UserModel.findById(link.userId, "username");
    res.json({ username: user?.username, content });
  } catch (e) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
