import { NextFunction, Request, Response } from "express";
import multer from "multer";
import cloudinary, {
  UploadApiOptions,
  UploadApiResponse,
} from "../utils/cloudinary";
import sanitize from "sanitize-filename";
import { BadRequestError, ErrorHandler } from "../utils/errors";

// Multer config
const storage = multer.memoryStorage();
export const foto = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      ![
        "image/png",
        "image/jpg",
        "image/jpeg",
        "image/gif",
        "image/webp",
      ].includes(file.mimetype as string)
    ) {
      cb(null, false);
      cb(new BadRequestError("Verkeerd filetype", 415));
    } else {
      cb(null, true);
    }
  },
});
export const file = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// file -> base64
const processUpload = async (file: Express.Multer.File): Promise<string> => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  let dataURI = `data:${file.mimetype};base64,${b64}`;
  return dataURI;
};

// base64 file -> cloudinary
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
    invalidate: true,
    folder,
  } as UploadApiOptions);
  return res;
};

// profiel foto uploader
export const foto_upload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.foto_upload = null;
    if (!req.file) {
      next();
      return;
    }
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

// bijlage uploader docenten
export const file_uploads_docent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.file_uploads = [];

    const files = req.files as Express.Multer.File[];

    if (!files || files.length == 0)
      throw new BadRequestError("Geen files meegegeven", 415);

    for (let file of files) {
      const dataURI = await processUpload(file);

      const filename =
        file.fieldname +
        "-" +
        Date.now() +
        "-" +
        sanitize(file.originalname.replace(/[\s-]/g, "_").replace(/_+/g, "_"));

      const cldRes = await handleUpload(
        dataURI,
        "bijlagen",
        //@ts-ignore
        filename
      );

      req.body.file_uploads.push(cldRes);
    }
    next();
  } catch (error) {
    ErrorHandler(error, req, res);
  }
};

// bijlage uploader docenten
export const file_uploads_student = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.file_uploads = [];
    //@ts-ignore
    const gebruiker = req.gebruiker;

    const files = req.files as Express.Multer.File[];

    if (!files || files.length == 0) {
      next();
      return;
    }

    for (let file of files) {
      const dataURI = await processUpload(file);

      const filename =
        file.fieldname +
        "-" +
        Date.now() +
        "-" +
        sanitize(file.originalname.replace(/[\s-]/g, "_").replace(/_+/g, "_"));

      const cldRes = await handleUpload(
        dataURI,
        `bijlagen_${gebruiker.id}`,
        //@ts-ignore
        filename
      );

      req.body.file_uploads.push(cldRes);
    }
    next();
  } catch (error) {
    ErrorHandler(error, req, res);
  }
};
