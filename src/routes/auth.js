import express from "express";
import passport from "passport";
import asyncWrapper from "../utils/asyncWrap.js";

import verifyJWT from "../middlewares/verifyJWT.js";
import authController from "../controllers/auth.js";

const router = express.Router();


router.post(
    "/create-password/:userId",
    verifyJWT,
    asyncWrapper(authController.createPassword),
);

router.post(
    "/change-password/:userId",
    verifyJWT,
    asyncWrapper(authController.changePassword),
);

router.post("/refresh", asyncWrapper(authController.authRefresh));

router.get("/user", verifyJWT, asyncWrapper(authController.authStatus));

router.post("/login", asyncWrapper(authController.authLogin));

router.post("/register", asyncWrapper(authController.authRegister));

router.post("/logout", asyncWrapper(authController.authLogout));

router.get(
    "/google",
    passport.authenticate("google", {
        failureRedirect: "/login",
        scope: ["profile", "email"],
    }),
);

router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: "/login",
    }),
    (req, res) => {
        authController.handleLoginSuccess(req.user, res);
    },
);

router.get("/login/success", authController.googleLoginSuccess);

router.get("/login/failed", authController.googleLoginFailure);

export default router;
