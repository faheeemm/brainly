import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken";
import { JWT_PASS } from "./config.js";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {

  const header = req.headers["authorization"];
  const decoded = jwt.verify(header as string, JWT_PASS) as { id: string };

  if (decoded) {
    req.userId = decoded.id;
    next();
  } else {
    res.status(403).json({ message: "You are not loggedin" });
  }
}