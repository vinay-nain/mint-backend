import jwt from "jsonwebtoken";

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = decoded;
        next();
    });
};

export default verifyJWT;
