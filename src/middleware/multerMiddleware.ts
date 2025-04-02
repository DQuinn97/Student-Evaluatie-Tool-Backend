import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage, type Options } from "multer-storage-cloudinary";
import { NextFunction, Request, Response } from "express";

export const upload = (req: Request, res: Response, next: NextFunction) => {
  //@ts-ignore
  const gebruiker = req.gebruiker;

  if (!gebruiker) {
    res.status(400).json({ message: "Onbekende gebruiker" });
    return;
  }
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
        return `profiel-${gebruiker._id}`;
      },
    } as Options["params"],
  });

  const upload = multer({ storage, limits: { fileSize: 3000000 } });

  return upload;
};
