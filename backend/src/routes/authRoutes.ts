import express from "express";

import {
  userLogin,
  userSignup,
  userLogout,
  getUser,
  getUserById,
} from "../controllers/authController";
import checkAuth from "../middleware/authMiddleware";
const router = express.Router();

router.post("/login", userLogin);
router.post("/signup", userSignup);
router.get("/user", checkAuth, getUser);
router.get("/users/:id", checkAuth, getUserById);
router.post("/logout", userLogout);
export default router;
