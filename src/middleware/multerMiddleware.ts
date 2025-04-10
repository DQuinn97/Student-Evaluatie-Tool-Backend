import { NextFunction, Request, Response } from "express";
import multer from "multer";
import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from "cloudinary";
import fs from "fs";
import path, { extname } from "path";
import sanitize from "sanitize-filename";
import { BadRequestError, ErrorHandler } from "../utils/errors";

// Multer - Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

export const memory = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const handleUpload = async (
  file: string,
  folder: string,
  filename: string
): Promise<UploadApiResponse> => {
  const res = await cloudinary.uploader.upload(file, {
    //@ts-ignore
    public_id: filename,
    resource_type: "auto",
    unique_filename: false,
    overwrite: true,
    folder,
  } as UploadApiOptions);
  return res;
};

const processUpload = async (file: Express.Multer.File): Promise<string> => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  let dataURI = `data:${file.mimetype};base64,${b64}`;
  return dataURI;
};
export const foto_upload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.foto_upload = null;
    if (!req.file) throw new BadRequestError("Geen foto meegegeven", 415);
    const dataURI = await processUpload(req.file);

    const cldRes = await handleUpload(
      dataURI,
      "profielen",
      //@ts-ignore
      `profiel-${req.gebruiker._id}`
    );
    req.body.foto_upload = cldRes;
    next();
  } catch (error) {
    ErrorHandler(error, req, res);
  }
};
