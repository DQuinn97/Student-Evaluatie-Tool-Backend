import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage, type Options } from "multer-storage-cloudinary";

// Multer - Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profielen",
    allowedFormats: ["jpg", "png", "jpeg", "webp", "gif"],
    public_id: (req, file) => {
      //@ts-ignore
      return `profiel-${req.gebruiker._id}`;
    },
  } as Options["params"],
});

export const upload = multer({ storage, limits: { fileSize: 3000000 } });
