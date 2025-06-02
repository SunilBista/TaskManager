import type { Request, Response } from "express";
import User from "../models/User";
import jwt, { Secret } from "jsonwebtoken";
import responseService from "../services/responseService";
import bcrypt from "bcrypt";

const secretKey: Secret = process.env.JWT_SECRET as string;
const maxAge = 3 * 24 * 60 * 60;

const handleErrors = (err: unknown): { email: string; password: string } => {
  let errors = { email: "", password: "" };

  if (err instanceof Error && "message" in err) {
    if (err.message.includes("user validation failed")) {
      if ("errors" in err) {
        Object.values(err.errors as Record<string, any>).forEach(
          ({ properties }) => {
            errors[properties.path as keyof typeof errors] = properties.message;
          }
        );
      }
    }
  }
  return errors;
};

const createWebToken = (id: string): string => {
  return jwt.sign({ id }, secretKey, { expiresIn: maxAge });
};

export const userLogout = (req: Request, res: Response): void => {
  res.send("logout");
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      res.status(401).json(responseService.notFoundError("No token found"));
      return;
    }

    const decoded = jwt.verify(token, secretKey) as { id: string };

    const user = await User.findById(decoded.id).select("email username");

    if (!user) {
      res.status(404).json(responseService.notFoundError("User not found"));
      return;
    }

    res.status(200).json(
      responseService.success(
        "User fetched successfully",
        {
          user: {
            email: user.email,
            username: user.username,
            _id: user._id,
          },
        },
        responseService.statusCodes.ok
      )
    );
  } catch (err) {
    res
      .status(401)
      .json(responseService.unauthorizedError("Invalid or expired token", err));
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(
      responseService.success(
        "User fetched successfully",
        {
          user: {
            email: user.email,
            username: user.username,
          },
        },
        responseService.statusCodes.ok
      )
    );
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const userLogin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    res
      .status(400)
      .json(responseService.error("Email and password are required"));
    return;
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json(responseService.error("The email does not exist"));
      return;
    }

    const validUser = await bcrypt.compare(password, user.password);

    if (!validUser) {
      res.status(400).json(responseService.error("The password is incorrect"));
      return;
    }

    const token = createWebToken(user._id.toString());

    res.cookie("token", token, { maxAge: maxAge * 1000, httpOnly: true });

    res.status(200).json(
      responseService.success(
        "Login successful",
        {
          token,
          user: {
            email: user.email,
            username: user.username,
          },
        },
        responseService.statusCodes.ok
      )
    );
  } catch (err) {
    res
      .status(500)
      .json(responseService.internalServerError("Server error", err));
  }
};

export const userSignup = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      res
        .status(409)
        .json(
          responseService.conflictError("Duplicate Email. User already exists")
        );
      return;
    }

    user = await User.create({ username, email, password });

    const token = createWebToken(user._id.toString());

    res.cookie("token", token, { httpOnly: true, maxAge: maxAge * 1000 });

    res.status(201).json(
      responseService.success(
        "User created successfully",
        {
          token,
          user: {
            email: user.email,
            username: user.username,
          },
        },
        responseService.statusCodes.created
      )
    );
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json(responseService.error("Signup failed", errors));
  }
};
