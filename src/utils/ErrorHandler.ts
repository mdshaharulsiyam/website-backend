import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export class CustomError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ------------------ HANDLERS ------------------

const handleZodError = (err: ZodError): CustomError => {
  const message = err.issues?.[0]?.message ?? "Invalid input data";
  return new CustomError(message, 400);
};

const handleCastError = (err: any): CustomError => {
  const message = `Invalid value for ${err.path}: ${err.value}`;
  return new CustomError(message, 400);
};

const handleValidationError = (err: any): CustomError => {
  const messages = Object.values(err.errors).map((val: any) => val.message);
  return new CustomError(`Invalid input data: ${messages.join(". ")}`, 400);
};

const handleDuplicateKeyError = (err: any, model = "Resource"): CustomError => {
  let message = "";

  if (err.keyValue) {
    message = Object.entries(err.keyValue)
      .map(
        ([key, value]) => `There is already a ${model} with ${key} "${value}".`,
      )
      .join(" ");
  } else if (Array.isArray(err.writeErrors)) {
    message = err.writeErrors.map((e: any) => e?.errmsg).join(" ");
  }

  return new CustomError(message || "Duplicate key error", 400);
};

const handleGenericError = (err: any): CustomError => {
  return new CustomError(
    err.message || "Something went wrong",
    err.statusCode || 500,
  );
};

// ------------------ FORMATTERS ------------------

const sendErrorDev = (res: Response, err: any) => {
  res.status(err.statusCode || 500).json({
    success: false,
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (res: Response, err: any) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR 💥:", err);
    res.status(500).json({
      success: false,
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

// ------------------ MAIN HANDLER ------------------

const ErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
  model?: string,
) => {
  let error = { ...err, message: err.message };

  if (err instanceof ZodError) error = handleZodError(err);
  else if (err.name === "CastError") error = handleCastError(err);
  else if (err.name === "ValidationError") error = handleValidationError(err);
  else if (err.code === 11000) error = handleDuplicateKeyError(err, model);
  else if (!(err instanceof CustomError)) error = handleGenericError(err);

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(res, error);
  } else {
    sendErrorProd(res, error);
  }
};

export default ErrorHandler;
