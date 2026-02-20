import User from "../models/User.js";
import Post from "../models/Post.js";
import Reservation from "../models/Reservation.js";

function convertToDate(dateString) {
    const [day, month, year] = dateString.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day));
}

const getBookings = async (req, res) => {
    let { postId } = req.params;
    let bookings = await Reservation.find({ postId: postId });
    res.status(200).json({ message: "bookings fetched", data: bookings });
};

const createBookings = async (req, res) => {
    let booking = await Reservation.create({
        ...req.body,
        check_in: convertToDate(req.body.check_in),
        check_out: convertToDate(req.body.check_out),
    });

    await Post.findByIdAndUpdate(
        req.body.postId,
        {
            $push: {
                bookings: booking._id,
            },
        },
        { new: true },
    );

    await User.findByIdAndUpdate(
        req.body.userId,
        { $push: { trips: booking._id } },
        { new: true },
    );

    res.status(200).json({ message: "booking confirmed" });
};

const getBooking = async (req, res) => {
    let { bookingId } = req.params;

    let booking = await Reservation.findById(bookingId);
    let post = await Post.findById(booking.postId);

    res.status(200).json({
        message: "fetched booking",
        data: { booking, post },
    });
};

const cancelBooking = async (req, res) => {
    let { bookingId } = req.params;
    await Reservation.findByIdAndDelete(bookingId);
    res.status(200).json({ message: "booking cancelled" });
};

export default { cancelBooking, createBookings, getBookings, getBooking };
