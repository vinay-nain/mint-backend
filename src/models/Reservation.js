import { Schema, model } from "mongoose";

const reservationSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        postId: {
            type: Schema.Types.ObjectId,
            ref: "Post",
        },
        check_in: Date,
        check_out: Date,
        price: Number,
        guests: Number,
    },
    { timestamps: true }
);

export default model("Reservation", reservationSchema);
