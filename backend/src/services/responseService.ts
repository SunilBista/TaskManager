interface StatusCodes {
  ok: number;
  created: number;
  badRequest: number;
  unauthorized: number;
  forbidden: number;
  notFound: number;
  internalServerError: number;
  serviceUnavailable: number;
}

const statusCodes: StatusCodes = {
  ok: 200,
  created: 201,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  internalServerError: 500,
  serviceUnavailable: 503,
};

interface ResponseData {
  success: boolean;
  message: string;
  data?: unknown;
  error?: unknown;
  status: number;
}

const responseService = {
  statusCodes,

  success(
    message: string,
    data: unknown = {},
    statusCode: number = statusCodes.ok
  ): ResponseData {
    return {
      success: true,
      message,
      data,
      status: statusCode,
    };
  },

  error(
    message: string,
    error: unknown = null,
    statusCode: number = statusCodes.badRequest
  ): ResponseData {
    return {
      success: false,
      message,
      error,
      status: statusCode,
    };
  },

  unauthorizedError(
    message: string,
    error: unknown = "Unauthorized"
  ): ResponseData {
    return this.error(message, error, statusCodes.unauthorized);
  },

  forbiddenError(message: string, error: unknown = "Forbidden"): ResponseData {
    return this.error(message, error, statusCodes.forbidden);
  },

  notFoundError(message: string, error: unknown = "Not Found"): ResponseData {
    return this.error(message, error, statusCodes.notFound);
  },

  internalServerError(
    message: string,
    error: unknown = "Internal Server Error"
  ): ResponseData {
    return this.error(message, error, statusCodes.internalServerError);
  },

  serviceUnavailableError(
    message: string,
    error: unknown = "Service Unavailable"
  ): ResponseData {
    return this.error(message, error, statusCodes.serviceUnavailable);
  },
};

export default responseService;
