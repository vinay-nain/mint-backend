import Joi from "joi";

const postSchema = Joi.object({
    post: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        type: Joi.string().required(),
        price: Joi.number().required(),
        checkInType: Joi.string().required(),
        parking: Joi.string().required(),
        amenities: Joi.array().items(Joi.string()).default([]),
        images: Joi.any().optional(),
        address: Joi.string().required(),
        guests: Joi.string().required(),
    }).required(),
});

const commentSchema = Joi.object({
    comment: Joi.object({
        comment: Joi.string().required(),
        rating: Joi.number().min(0).max(5).required(),
        commentId: Joi.string().required(),
        author: Joi.string().required(),
    }).required(),
});

const userSchema = Joi.object({
    user: Joi.object({
        username: Joi.string().required(),
        email: Joi.string()
            .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
            .required(),
        password: Joi.string().min(8).max(30).required(),
    }).required(),
});

export { userSchema, postSchema, commentSchema };
