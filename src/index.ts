
import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { UserModel } from "./db.js";

const app = express();

app.post("/api/v1/signup", async (req, res) => {
  
  // TODO1: Add Zod Validation
  const username = req.body.username;
  const password = req.body.password;

  // TODO2: Hash the password
  await UserModel.create({ username, password });

  res.json({ message: "User signed up!" });
});


app.post("/api/v1/signin", (req, res) => {
  
  const username = req.body.username;
  const password = req.body.password;
  
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