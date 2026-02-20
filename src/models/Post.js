import mongoose, { Schema } from "mongoose";
import Comment from "./Comment.js";
import User from "./User.js";
import Reservation from "./Reservation.js";

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
        },
        description: {
            type: String,
        },
        type: String,
        price: String,
        checkInType: {
            type: String,
        },
        parking: {
            type: String,
        },
        guests: {
            adults: Number,
            children: Number,
            infants: Number,
            pets: Boolean,
        },
        images: [
            {
                url: String,
                filename: String,
            },
        ],
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        comments: [
            {
                type: Schema.Types.ObjectId,
                ref: "Comment",
            },
        ],
        geometry: {
            type: {
                type: String,
                enum: ["Point"],
            },
            coordinates: {
                type: [Number],
            },
        },
        address: {
            flatnumber: String,
            street: String,
            landmark: String,
            city: String,
            district: String,
            state: String,
            pincode: String,
            country: String,
        },
        bookings: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Reservation",
            },
        ],
        amenities: [String],
    },
    { timestamps: true },
);

postSchema.post("findOneAndDelete", async (post) => {
    if (post) {
        let comments = await Comment.find({
            _id: { $in: post.comments },
        }).select("author _id");

        await User.updateMany(
            { _id: { $in: comments.map((c) => c.author) } },
            { $pull: { comments: { $in: post.comments } } },
        );

        await Comment.deleteMany({
            _id: { $in: post.comments },
        });
    }
});

const Post = new mongoose.model("Post", postSchema);

export default Post;
