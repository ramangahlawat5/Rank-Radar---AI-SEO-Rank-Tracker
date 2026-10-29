import express from "express";
import { getUser, login, register } from "../controllers/authController.js";
import auth from "../middleware/auth.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/user", auth, getUser);      // getUser called only if auth calls next()

export default authRouter;























{/*
    Why separate these files?
        authRoutes.js defines which endpoint to call, while authController.js defines what happens when that endpoint is called.

    express.Router() creates a separate router to organize related API endpoints.
*/}