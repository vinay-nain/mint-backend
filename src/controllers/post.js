import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import ErrorClass from "../utils/errorClass.js";
import { geoCodeAddress } from "../libs/postUtils.js";
import Reservation from "../models/Reservation.js";

const getPosts = async (req, res) => {
    const data = await Post.find({}).select(
        "price address.city _id type images checkInType",
    );
    res.status(200).json({ message: "posts fetched", data: data });
};

const createNewPost = async (req, res) => {
    let response = await geoCodeAddress(JSON.parse(req.body.post.address));
    const { userId } = req.params;
    let user = await User.findById(userId);

    if (!user) throw new ErrorClass(400, "user not found");

    const images = req.files.map((file) => ({
        url: file.path,
        filename: file.filename,
    }));

    let newPost = await Post.create({
        ...req.body.post,
        owner: user._id,
        images: images,
        guests: JSON.parse(req.body.post.guests),
        address: JSON.parse(req.body.post.address),
        geometry: response.fullResponse.features[0].geometry,
    });

    user.posts.push(newPost._id);
    await user.save();
    res.status(200).json({ message: "post created" });
};

const getUsersPosts = async (req, res) => {
    const { userId } = req.params;
    const posts = await Post.find({ owner: userId });
    res.status(200).json({ message: "posts fetched", data: posts });
};

const getPost = async (req, res) => {
    let postId = req.params.postId;
    if (!postId) return res.status(400).json({ message: "post not found" });
    let post = await Post.findById(postId)
        .select("-__v -updatedAt")
        .populate("owner", "-password -provider -comments -updatedAt -__v");
    res.status(200).json({ message: "post fetched", data: post });
};

const getComments = async (req, res) => {
    let { postId } = req.params;
    let comments = await Comment.find({ post: postId }).populate("author");
    res.status(200).json({ message: "comments fetched", data: comments });
};

const newComment = async (req, res) => {
    let { postId } = req.params;

    let post = await Post.findById(postId);
    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    let user = await User.findById(post.owner);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    let newComment = await Comment.create({
        ...req.body.comment,
        post: postId,
    });

    if (!user.comments) user.comments = [];
    if (!post.comments) post.comments = [];

    user.comments.push(newComment._id);
    post.comments.push(newComment._id);

    await post.save();
    await user.save();

    res.status(200).json({
        message: "commented",
        comment: newComment,
    });
};

const deleteComment = async (req, res) => {
    let { postId, commentId } = req.params;
    let comment = await Comment.findOne({ commentId: commentId });
    await User.findByIdAndUpdate(comment.author, {
        $pull: { comments: comment._id },
    });

    await Post.findByIdAndUpdate(postId, {
        $pull: { comments: comment._id },
    });
    await Comment.findByIdAndDelete(comment._id);
    res.status(200).json({ message: "deleted" });
};

const editPost = async (req, res) => {
    let { postId } = req.params;
    if (!postId) return res.status(400).json({ message: "post not found" });

    let post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "post not found" });

    const parsedAddress = JSON.parse(req.body.post.address);
    let geoResponse = await geoCodeAddress(parsedAddress);

    const updatedData = {
        ...req.body.post,
        guests: JSON.parse(req.body.post.guests),
        address: parsedAddress,
        geometry: geoResponse.fullResponse.features[0].geometry,
    };

    // If new images are uploaded, append or replace existing ones
    if (req.files && req.files.length > 0) {
        const newImages = req.files.map((file) => ({
            url: file.path,
            filename: file.filename,
        }));
        updatedData.images = [...post.images, ...newImages];
    }

    let updatedPost = await Post.findByIdAndUpdate(postId, updatedData, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({ message: updatedPost });
};

const deletePost = async (req, res) => {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    const user = await User.findById(post.owner);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    user.posts = user.posts.filter((elem) => !elem.equals(postId));

    await user.save();
    await Post.findOneAndDelete({ _id: postId });

    res.status(200).json({ message: "Post deleted successfully" });
};

const addToFavourite = async (req, res) => {
    let { postId } = req.params;
    let post = await Post.findById(postId);

    if (!post)
        return res.status(400).json({ message: "listing doesn't exist" });

    let userId = req.body.user;

    await User.findByIdAndUpdate(userId, {
        $addToSet: { favourites: postId },
    });

    res.status(200).json({ message: "listing added to favourite" });
};

const removeFromFavourite = async (req, res) => {
    let { postId } = req.params;
    let post = await Post.findById(postId);

    if (!post)
        return res.status(400).json({ message: "listing doesn't exist" });

    let userId = req.body.user;

    await User.findByIdAndUpdate(userId, {
        $pull: { favourites: postId },
    });

    res.status(200).json({ message: "listing removed from favourite" });
};

const getSearchPosts = async (req, res) => {
    const { check_in, check_out, adults, children, infants, pets } = req.query;

    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);

    if (isNaN(checkInDate) || isNaN(checkOutDate)) {
        return res
            .status(400)
            .json({ message: "Invalid check_in or check_out date." });
    }

    if (checkInDate > checkOutDate) {
        return res
            .status(400)
            .json({ message: "check_in must be before check_out." });
    }

    const overlappingReservations = await Reservation.find({
        check_in: { $lt: checkOutDate },
        check_out: { $gt: checkInDate },
    }).select("postId");

    const unavailablePostIds = overlappingReservations.map((r) =>
        r.postId.toString(),
    );

    const filter = {
        _id: { $nin: unavailablePostIds },
    };

    if (Number(adults) > 0) filter["guests.adults"] = { $gte: Number(adults) };
    if (Number(children) > 0)
        filter["guests.children"] = { $gte: Number(children) };
    if (Number(infants) > 0)
        filter["guests.infants"] = { $gte: Number(infants) };

    if (pets === "true" || pets === "1") {
        filter["guests.pets"] = true;
    }

    const availablePosts = await Post.find(filter)
        .populate("owner", "name email avatar")
        .select("-bookings -comments");

    res.status(200).json({
        message: "Fetched available posts",
        count: availablePosts.length,
        data: availablePosts,
    });
};

export default {
    deletePost,
    deleteComment,
    editPost,
    newComment,
    getComments,
    getPost,
    getUsersPosts,
    createNewPost,
    getPosts,
    addToFavourite,
    removeFromFavourite,
    getSearchPosts,
};
