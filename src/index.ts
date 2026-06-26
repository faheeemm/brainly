
import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { UserModel } from "./db.js";
import { JWT_PASS } from "./config.js";

const app = express();
app.use(express.json());

// console.log(process.env.MONGODB_URL);

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

app.post("/api/v1/content", (req, res) => {
  
});

app.get("/api/v1/content", (req, res) => {
  
});

app.delete("/api/v1/content", (req, res) => {
  
});

app.post("/api/v1/brain/share", (req, res) => {
  
});

app.get("/api/v1/brain/:shareLink", (req, res) => {
  
});


app.listen(3000);