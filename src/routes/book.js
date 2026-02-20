import { Router } from "express";
import bookingController from "../controllers/book.js";
import asyncWrapper from "../utils/asyncWrap.js";

const router = Router();

router.get("/cancel/:bookingId", asyncWrapper(bookingController.getBooking));

router.get("/bookings/:postId", asyncWrapper(bookingController.getBookings));

router.post(
    "/bookings/:postId",
    asyncWrapper(bookingController.createBookings),
);

router.delete(
    "/cancel/:bookingId",
    asyncWrapper(bookingController.cancelBooking),
);

export default router;
