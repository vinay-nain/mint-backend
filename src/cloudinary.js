import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// cloudinary.config({
//     cloud_name: process.env.CLOUD_NAME,
//     api_key: process.env.CLOUD_API_KEY,
//     api_secret: process.env.CLOUD_API_SECRET,
// });
cloudinary.config({
    cloud_name:"dnqfpy14q",
    api_key: "418788342743685",
    api_secret:"NsiNX7HDO76AM28O4ajfqKqSOss",
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "posts",
        allowedFormats: ["png", "jpeg", "jpg"],
    },
});

export { cloudinary, storage};