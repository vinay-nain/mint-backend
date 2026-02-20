import express from "express";
import asyncWrapper from "../utils/asyncWrap.js";
import usersController from "../controllers/user.js";

const router = express.Router();

router.get("/trips/:userId", asyncWrapper(usersController.getUserTrips));

router.get("/comments/:userId", asyncWrapper(usersController.getUserComments));

router.get("/host/:hostId", asyncWrapper(usersController.getHost));

router.get(
    "/favourites/:userId",
    asyncWrapper(usersController.getUserFavourites),
);

export default router;
