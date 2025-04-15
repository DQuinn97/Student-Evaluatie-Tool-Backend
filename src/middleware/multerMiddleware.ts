import { NextFunction, Request, Response } from "../utils/types";
import multer from "multer";
import cloudinary, {
  UploadApiOptions,
  UploadApiResponse,
} from "../utils/cloudinary";
import sanitize from "sanitize-filename";
import { BadRequestError, ErrorHandler } from "../utils/errors";

/**
 * Multer config
 */
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

// Zet multer file data om in base64 string
const processUpload = async (file: Express.Multer.File): Promise<string> => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  let dataURI = `data:${file.mimetype};base64,${b64}`;
  return dataURI;
};

// Upload base64 string naar cloudinary in een specifieke folder, met een specifieke naam
const handleUpload = async (
  file: string,
  folder: string,
  filename: string
): Promise<UploadApiResponse> => {
  const res = await cloudinary.uploader.upload(file, {
    public_id: filename,
    resource_type: "auto",
    unique_filename: false,
    overwrite: true,
    invalidate: true,
    folder,
  } as UploadApiOptions);

  // return het resultaat; object met link naar file en file details
  return res;
};

/**
 * foto uploader: upload met specifieke config voor profielfotos
 */
export const foto_upload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // reset foto_upload -> voorkomt foutieve data ingaven
    req.body.foto_upload = null;

    // als multer geen file vond, ga gewoon door naar de volgende functie in de route
    if (!req.file) {
      next();
      return;
    }
    // file -> base64
    const dataURI = await processUpload(req.file);

    // base64 -> upload met profielfoto config
    const cldRes = await handleUpload(
      dataURI,
      "profielen",
      `profiel-${req.gebruiker._id}`
    );

    // zet resultaat in req.body
    req.body.foto_upload = cldRes;
    next();
  } catch (error) {
    ErrorHandler(error, req, res);
  }
};

/**
 * file uploader docenten: upload met specifieke config voor docenten
 */
export const file_uploads_docent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // reset foto_upload -> voorkomt foutieve data ingaven
    req.body.file_uploads = [];

    // Check of er multer files zijn
    const files = req.files as Express.Multer.File[];
    if (!files || files.length == 0) {
      next();
      return;
    }

    // Loop door de files
    for (let file of files) {
      // file -> base64
      const dataURI = await processUpload(file);

      // genereer unieke filename
      const filename =
        "bijlagen" +
        "-" +
        Date.now() +
        "-" +
        sanitize(
          file.originalname
            .split(".")[0]
            .replace(/[\s-]/g, "_")
            .replace(/_+/g, "_")
        );

      // base64 -> upload met docent file config
      const cldRes = await handleUpload(dataURI, "bijlagen", filename);

      // zet resultaat in req.body
      req.body.bijlagen = req.body.bijlagen || [];
      req.body.file_uploads.push(cldRes);
    }
    next();
  } catch (error) {
    ErrorHandler(error, req, res);
  }
};

/**
 * file uploader studenten: upload met specifieke config voor studenten
 */
export const file_uploads_student = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // reset foto_upload -> voorkomt foutieve data ingaven
    req.body.file_uploads = [];

    const gebruiker = req.gebruiker;

    // Check of er multer files zijn, zoniet ga gewoon door
    const files = req.files as Express.Multer.File[];
    if (!files || files.length == 0) {
      next();
      return;
    }

    // Loop door de files
    for (let file of files) {
      // file -> base64
      const dataURI = await processUpload(file);

      // genereer unieke filename
      const filename =
        "bijlagen" +
        "-" +
        Date.now() +
        "-" +
        sanitize(
          file.originalname
            .split(".")[0]
            .replace(/[\s-]/g, "_")
            .replace(/_+/g, "_")
        );

      // base64 -> upload met student file config
      const cldRes = await handleUpload(
        dataURI,
        `bijlagen_${gebruiker.id}`,
        filename
      );

      // zet resultaat in req.body
      req.body.bijlagen = req.body.bijlagen || [];
      req.body.file_uploads.push(cldRes);
    }
    next();
  } catch (error) {
    ErrorHandler(error, req, res);
  }
};
