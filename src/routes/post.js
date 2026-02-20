import express from "express";
import listingsController from "../controllers/post.js";
import { storage } from "../cloudinary.js";
import multer from "multer";
import { validatePost, validateComment } from "../middlewares/validation.js";
import asyncWraper from "../utils/asyncWrap.js";

const upload = multer({ storage });
const router = express.Router();

// root
router.get("/", (req, res) => {
    res.send("nothing here");
});

// get all posts
router.get("/posts", asyncWraper(listingsController.getPosts));

router.get("/posts/search", asyncWraper(listingsController.getSearchPosts));

// create new post
router.post(
    "/posts/:userId/new",
    upload.array("post[images]", 5),
    validatePost,
    asyncWraper(listingsController.createNewPost),
);

// get a specific post
router.get("/posts/:postId", asyncWraper(listingsController.getPost));

// get all comments on a post
router.get("/comments/:postId", asyncWraper(listingsController.getComments));

// create a new comment
router.post(
    "/comments/:postId",
    validateComment,
    asyncWraper(listingsController.newComment),
);

// delete a comment
router.delete(
    "/comments/:postId/:commentId",
    asyncWraper(listingsController.deleteComment),
);

// get users posts
router.get("/users/:userId", asyncWraper(listingsController.getUsersPosts));

// edit the post
router.patch(
    "/posts/:userId/:postId",
    asyncWraper(listingsController.editPost),
);

// delete a post
router.delete(
    "/posts/:userId/:postId",
    asyncWraper(listingsController.deletePost),
);

router.patch("/save/:postId", asyncWraper(listingsController.addToFavourite));

router.patch(
    "/unsave/:postId",
    asyncWraper(listingsController.removeFromFavourite),
);

export default router;
