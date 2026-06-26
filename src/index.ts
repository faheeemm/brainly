import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { ContentModel, LinkModel, UserModel } from "./db.js";
import { JWT_PASS } from "./config.js";
import { userMiddleware } from "./middleware.js";

const app = express();
app.use(express.json());

// ─── AUTH ────────────

app.post("/api/v1/signup", async (req, res) => {
  
  // TODO1: Add Zod Validation
  const username = req.body.username;
  const password = req.body.password;

  // TODO2: Hash the password
  try {
    
    await UserModel.create({ username, password });
    res.json({ message: "User signed up!" });
    
  } catch (e) {
    
    res.status(411).send({ message: "User already exists!" });
  }
});


app.post("/api/v1/signin", async (req, res) => {
  
  const username = req.body.username;
  const password = req.body.password;

  const existingUser = await UserModel.findOne({ username, password });

  if (existingUser) {
    
    const token = jwt.sign({
      id: existingUser._id,
    }, JWT_PASS);

    // returns the token of a user when signedin
    res.json({ token });
  } else {
    res.status(403).json({ message: "Invalid Creds!" });
  }
});

// ─── CONTENT ────────────

app.post("/api/v1/content", userMiddleware, async (req, res) => {
  const link = req.body.link;
  const type = req.body.type;

  await ContentModel.create({
    link,
    // type,
    userId: req.userId,
    tags: []
  });

  console.log("post request: ", req.userId);
  
  res.json({ message: "content added" });
});

app.get("/api/v1/content", userMiddleware, async (req, res) => {
  
  // const userId = req.query.userId;
  const userId = req.userId;
  try {
    //@ts-ignore
    const content = await ContentModel.find({ userId }).populate("userId", "username");
    res.json({ content }); 
  } catch (e) {
    return e;
  }
  console.log("get request: ", req.query.userId);
  
});

app.delete("/api/v1/content", userMiddleware, async (req, res) => {
  const contentId = req.body.contentId;

  await ContentModel.deleteMany({
    _id: new mongoose.Types.ObjectId(contentId),
    userId: new mongoose.Types.ObjectId(req.userId),
  });

  res.json({ message: "Deleted!" });
});

// ─── BRAIN SHARE ────────────

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
      "username"
    );
    
    const user = await UserModel.findById(link.userId, "username");
    res.json({ username: user?.username, content });
  } catch (e) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));