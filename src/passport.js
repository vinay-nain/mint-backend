import passport from "passport";
import passportLocal from "passport-local";
import passportGoogle from "passport-google-oauth20";
import User from "./models/User.js";
import { verifyPass } from "./libs/passwordUtils.js";
import dotenv from "dotenv";
dotenv.config({quiet: true});
var GoogleStrategy = passportGoogle.Strategy;
var LocalStrategy = passportLocal.Strategy;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

let verifyLocal = async (email, password, done) => {
    try {
        let user = await User.findOne({ email: email });

        if (!user) return done(null, false, { message: "email not found" });

        const isValid = await verifyPass(password, user.password);

        if (!isValid)
            return done(null, false, {
                message: "incorrect email or password",
            });

        return done(null, user);
    } catch (error) {
        console.log(error);
        return done(error);
    }
};

let localStrategy = new LocalStrategy({ usernameField: "email" }, verifyLocal);
passport.use(localStrategy);

passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: "https://mint-backend-cjfc.onrender.com/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            let user = await User.findOne({ email: profile.emails[0].value });
            console.log(profile);

            if (!user) {
                user = await User.create({
                    email: profile.emails[0].value,
                    provider: profile.provider,
                    username: profile.displayName,
                    has_pass: false,
                });
            }

            done(null, user);
        },
    ),
);

passport.serializeUser((user, done) => {
    if (!user || !user._id) {
        return done(new Error("not user present"));
    }

    done(null, user._id);
});

passport.deserializeUser((userId, done) => {
    User.findById(userId)
        .then((user) => {
            done(null, user);
        })
        .catch((error) => done(error));
});
