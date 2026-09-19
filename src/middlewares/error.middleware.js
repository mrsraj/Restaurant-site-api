import AppError from "../utils/app-error.js";

const errorMiddleware = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof AppError) {
    return res.status(error.status).json(error.payload);
  }

  const status =
    error.status >= 400 && error.status < 500
      ? error.status
      : 500;

  if (status === 500) {
    console.error(error);
  }

  return res.status(status).json({
    message:
      status === 500
        ? "Internal server error"
        : error.message,
  });
};

export default errorMiddleware;