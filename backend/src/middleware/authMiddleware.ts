import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET as string;

interface AuthRequest extends Request {
  user?: string;
}

const checkAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ error_message: "No token, authorization denied." });
    return;
  }

  try {
    const decodedInfo = jwt.verify(token, secretKey) as JwtPayload;
    req.user = decodedInfo.id;
    next();
  } catch (err) {
    res.status(401).json({ error_message: "Token is not valid" });
  }
};

export default checkAuth;
