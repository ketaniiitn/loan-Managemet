import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthPayload {
  id: string;
  email: string;
  role: string;
}

// export const authenticateToken = (
//   req: Request & { user?: AuthPayload },
//   res: Response,
//   next: NextFunction
// ) => {
//   const authHeader = req.headers.authorization;
//   const token = authHeader?.split(" ")[1];

//   if (!token) {
//     return res.status(401).json({ message: "Token missing or unauthorized" });
//   }

//   try {
//     const secret = process.env.JWT_SECRET || "your_default_secret";
//     const decoded = jwt.verify(token, secret) as AuthPayload;
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(403).json({ message: "Invalid or expired token" });
//   }
// };




export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Token missing or unauthorized" });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || "your_default_secret";
    const decoded = jwt.verify(token, secret) as AuthPayload;
    req.user = decoded;
    next();
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("JWT verification failed:", err);
    }
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
