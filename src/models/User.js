import mongoose, { Schema } from "mongoose";

const userSchema = mongoose.Schema(
    {
        email: {
            type: String,
        },
        username: {
            type: String,
        },
        password: {
            type: String,
        },
        provider: {
            type: String,
        },
        has_pass: {
            type: Boolean,
        },
        posts: [
            {
                type: Schema.Types.ObjectId,
                ref: "Post",
            },
        ],
        comments: [
            {
                type: Schema.Types.ObjectId,
                ref: "Comment",
            },
        ],
        bookings: [
            {
                type: Schema.Types.ObjectId,
                ref: "Reservation",
            },
        ],
        trips: [
            {
                type: Schema.Types.ObjectId,
                ref: "Reservation",
            },
        ],
        favourites: [
            {
                type: Schema.Types.ObjectId,
                ref: "Post",
            },
        ],
    },
    { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
