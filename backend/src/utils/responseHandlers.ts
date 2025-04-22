import { Response } from "express";

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

interface ApiResponse {
  success: boolean;
  message?: string;
  errors?: any;
  [key: string]: any;
}

export const responseHandler = (
  res: Response,
  statusCode: HttpStatus,
  payload: Record<string, any> = {},
  message?: string
): Response => {
  const response: ApiResponse = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    ...payload,
  };
  return res.status(statusCode).json(response);
};

export const errorHandler = (res: Response, error: any): Response => {
  const response: ApiResponse = {
    success: false,
    message: error.message || "An unexpected error occurred",
  };

  let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

  if (error.name === "BadRequestError") {
    statusCode = HttpStatus.BAD_REQUEST;
    response.errors = error.errors || [];
  } else if (error.name === "UnauthorizedError") {
    statusCode = HttpStatus.UNAUTHORIZED;
  } else if (error.name === "ForbiddenError") {
    statusCode = HttpStatus.FORBIDDEN;
  } else if (error.name === "NotFoundError") {
    statusCode = HttpStatus.NOT_FOUND;
  }

  if (
    Array.isArray(error) &&
    error.length > 0 &&
    "param" in error[0] &&
    "msg" in error[0]
  ) {
    statusCode = HttpStatus.BAD_REQUEST;
    response.errors = error;
  }

  return res.status(statusCode).json(response);
};
