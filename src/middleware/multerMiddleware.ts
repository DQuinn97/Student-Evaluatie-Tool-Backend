import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage, type Options } from "multer-storage-cloudinary";
import path from "path";
import sanitize from "sanitize-filename";

// Multer - Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const foto_storage = new CloudinaryStorage({
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

const file_storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "inzendingen",
    public_id: (req, file) => {
      const uniqueSuffix = "bijlage-" + Date.now() + "-";

      return (
        uniqueSuffix +
        path.parse(
          sanitize(file.originalname.replace(/[\s-]/g, "_").replace(/_+/g, "_"))
        ).name
      );
    },
  } as Options["params"],
});

export const foto_upload = multer({
  storage: foto_storage,
  limits: { fileSize: 3000000 },
});
