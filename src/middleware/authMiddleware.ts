import dotenv from "dotenv";
dotenv.config(); 
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import status from "../utils/http_codes";
import { isTokenExpired } from "../utils/Token_utils"; 
import ActiveToken from "../models/ActiveTokens";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface CustomRequest extends Request {
  user?: any;
  token?: string;
  [key: string]: any;
}

export default async function authenticateToken(req: CustomRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  if (!token) return res.status(status.UNAUTHORIZED).json({ message: "Token required....!!!" });

  if (await isTokenExpired(token)) {
    return res.status(status.FORBIDDEN).json({ message: "Token has been logged out" });
  }
  let payload: any;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err: any) {
    console.error("JWT verify error:", err.message);
    return res.status(status.FORBIDDEN).json({ message: "Invalid or expired token" });
  }

  const stillActive = await ActiveToken.findOne({ token });
  if (!stillActive) {
    return res.status(status.FORBIDDEN).json({ message: "Token is no longer active" });
  }

  req.user = payload as any;
  req.token = token;
  next();
}
