import { Request, Response, NextFunction } from "express";
import globalErrorHandler from "../utils/globalErrorHandler";
import { AnyZodObject } from "zod";
import config from "../DefaultConfig/config";
import { UnlinkFiles } from "./fileUploader";

const validateRequest = (
  schema: AnyZodObject,
  type: string = config.TOKEN_NAME,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.files) {
        const img =
          (!Array.isArray(req.files) &&
            req.files?.img &&
            req.files.img.length > 0 &&
            req.files.img?.map((doc: any) => doc.path)) ||
          [];
        const video =
          (!Array.isArray(req.files) &&
            req.files?.video &&
            req.files.video.length > 0 &&
            req.files.video?.map((doc: any) => doc.path)) ||
          [];
        const logo =
          (!Array.isArray(req.files) &&
            req.files?.logo &&
            req.files.logo.length > 0 &&
            req.files.logo?.map((doc: any) => doc.path)) ||
          [];
        const documents =
          (!Array.isArray(req.files) &&
            req.files?.documents &&
            req.files.documents.length > 0 &&
            req.files.documents?.map((doc: any) => doc.path)) ||
          [];
        const business_documents =
          (!Array.isArray(req.files) &&
            req.files?.business_documents &&
            req.files.business_documents.length > 0 &&
            req.files.business_documents?.map((doc: any) => doc.path)) ||
          [];
        const banner =
          (!Array.isArray(req.files) &&
            req.files?.banner &&
            req.files.banner.length > 0 &&
            req.files.banner?.map((doc: any) => doc.path)) ||
          [];
        if (img.length > 0) req.body.img = img;
        if (banner.length > 0) req.body.banner = banner;
        if (logo.length > 0) req.body.logo = logo;
        if (video.length > 0) req.body.video = video;
        if (documents.length > 0) req.body.documents = documents;
        if (business_documents.length > 0)
          req.body.business_documents = business_documents;

        req.body.all_images = [
          ...business_documents,
          ...documents,
          ...video,
          ...logo,
          ...banner,
          ...img,
        ];
      }
      await schema.parseAsync({
        body: req.body,
        cookies: req.headers.authorization || req.cookies[type],
      });
      return next();
    } catch (error) {
      if (req.body?.all_images?.length > 0) {
        UnlinkFiles(req.body?.all_images);
      }
      globalErrorHandler(error, req, res, next);
    }
  };
};

export default validateRequest;
