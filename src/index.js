import dotenv from "dotenv";
dotenv.config({ quiet: true });
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import passport from "passport";
import cookieParser from "cookie-parser";
import ErrorClass from "./utils/errorClass.js";
import authRoute from "./routes/auth.js";
import postRoute from "./routes/post.js";
import bookRoute from "./routes/book.js";
import userRoute from "./routes/user.js";
import "./passport.js";

const app = express();
app.set("PORT", process.env.PORT || 3000);
app.set("MONGOURI", process.env.MONGO_URI);

app.use(cookieParser());
app.use(
    cors({
        origin: "https://mintforeveryone.vercel.app",
        methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
        credentials: true,
    }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use("/users", userRoute);
app.use("/auth", authRoute);
app.use(postRoute);
app.use(bookRoute);

app.use((req, res, next) => {
    next(new ErrorClass(404, `requrest url: ${req.originalUrl} not found!`));
});

app.use((error, req, res, next) => {
    let { statusCode = 500, message = "page not found!" } = error;
    console.log(error);
    res.status(statusCode).json({ message: message });
});

async function start() {
    try {
        let conn = await mongoose.connect(app.get("MONGOURI"));
        console.log("connected to db", conn.connection.host);
    } catch (error) {
        console.log("error in connecting to db");
    }
    app.listen(app.get("PORT"), () => {
        console.log("server is listening on port:", app.get("PORT"));
    });
}

start();