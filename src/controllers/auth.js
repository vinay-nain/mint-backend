import jwt from "jsonwebtoken";
import passport from "passport";
import User from "../models/User.js";
import { genPass, verifyPass } from "../libs/passwordUtils.js";
import { generateAccessToken, generateRefreshToken } from "../utils/utils.js";

const handleLoginSuccess = (user, res) => {
    const email = user.email || (user._json && user._json.email);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // for production
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "prod",
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // for local
    // res.cookie("refreshToken", refreshToken, {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === "prod",
    //     sameSite: "lax",
    //     maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    const isOAuth = user.provider === "google";

    if (isOAuth) {
        return res.redirect(`https://mintforeveryone.vercel.app`);
    }

    return res.status(200).json({
        message: "Login successful",
        accessToken,
        user: {
            id: user._id,
            email,
            username: user.username,
        },
    });
};

const authRefresh = async (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        return res.sendStatus(401);
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const newAccessToken = jwt.sign(
        { id: decoded.id },
        process.env.JWT_SECRET,
        {
            expiresIn: "15m",
        },
    );

    res.status(200).json({ accessToken: newAccessToken });
};

const authStatus = async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) return res.status(404).json({ message: "user not found" });

    res.status(200).json({
        message: "logged in",
        user: user,
    });
};

const authLogin = (req, res, next) => {
    passport.authenticate("local", { session: false }, (error, user, info) => {
        if (error) return next(error);
        console.log(user);

        if (!user) {
            return res.status(401).json({
                message: info?.message || "invalid email or password",
            });
        }

        handleLoginSuccess(user, res);
    })(req, res, next);
};

const authRegister = async (req, res, next) => {
    let { email, username, password } = req.body;

    if (!email || !username || !password)
        return res.status(400).json({ message: "all fields required" });

    let user = await User.findOne({ email: email });

    if (user) return res.status(400).json({ message: "email already exists" });

    const hash = await genPass(password);
    const newUser = await User.create({
        email: email,
        password: hash,
        username: username,
        provider: "local",
        has_pass: true,
    });

    res.status(200).json({
        ok: true,
        message: "user created",
        userId: newUser._id,
    });
};

const authLogout = (req, res, next) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/",
    });

    req.logout(function (err) {
        if (err) return next(err);

        return res.status(200).json({
            message: "Logged out successfully",
        });
    });
};

const googleLoginSuccess = (req, res) => {
    if (req.user) {
        res.status(200).json({
            success: true,
            message: "success",
            user: req.user,
        });
    }
};

const googleLoginFailure = (req, res) => {
    res.status(401).json({
        success: false,
        message: "failure",
    });
};

const changePassword = async (req, res) => {
    let user = await User.findById(req.params.userId);
    let isValid = await verifyPass(req.body.old, user.password);

    if (!isValid)
        return res.status(400).json({ message: "incorrect password" });

    let newPass = await genPass(req.body.new);

    await User.findByIdAndUpdate(req.params.userId, { password: newPass });

    res.status(200).json({ message: "password changed" });
};

const createPassword = async (req, res) => {
    let user = await User.findById(req.params.userId);

    if (user.has_pass)
        return res.status(400).json({ message: "password already exists" });

    let newPass = await genPass(req.body.new);
    await User.findByIdAndUpdate(req.params.userId, {
        password: newPass,
        has_pass: true,
    });

    res.status(200).json({ message: "password created" });
};

export default {
    handleLoginSuccess,
    authRefresh,
    authStatus,
    authLogin,
    authRegister,
    authLogout,
    googleLoginSuccess,
    googleLoginFailure,
    changePassword,
    createPassword,
};
