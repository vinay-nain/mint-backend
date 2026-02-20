import User from "../models/User.js";

const getHost = async (req, res) => {
    let { hostId } = req.params;
    let host = await User.findById(hostId);
    res.status(200).json({ message: "user fetched", data: host });
};

const getUserComments = async (req, res) => {
    let { userId } = req.params;
    let comments = await User.findById(userId)
        .select("comments")
        .populate("comments");
    res.status(200).json({ message: "user comments", data: comments });
};

const getUserFavourites = async (req, res) => {
    let { userId } = req.params;
    let favs = await User.findById(userId)
        .select("favourites")
        .populate("favourites");
    console.log(favs);

    res.status(200).json({ message: "user favourites", data: favs });
};

const getUserTrips = async (req, res) => {
    let { userId } = req.params;
    let trips = await User.findById(userId).select("trips").populate("trips");
    console.log(trips);

    res.status(200).json({ message: "user trips", data: trips });
};

export default {
    getHost,
    getUserComments,
    getUserFavourites,
    getUserTrips
};
