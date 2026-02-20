import mongoose, { Schema } from "mongoose";
import User from "./User.js";
import Post from "./Post.js"

const commentSchema = mongoose.Schema(
    {
        comment: {
            type: String,
        },
        rating: {
            type: Number,

        },
        commentId: {
            type: String,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        post: {
            type: Schema.Types.ObjectId,
            ref: "Post"
        }
    },
    { timestamps: true },
);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
