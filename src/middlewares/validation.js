import { postSchema, commentSchema } from "../schemaValidation.js";
import ErrorClass from "../utils/errorClass.js";

const validatePost = (req, res, next) => {
    let { error } = postSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ErrorClass(400, errMsg);
    } else {
        next();
    }
};

const validateComment = (req, res, next) => {
    let { error } = commentSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ErrorClass(400, errMsg);
    } else {
        next();
    }
};

export { validatePost, validateComment };
