import { StatusCodes, getReasonPhrase } from 'http-status-codes';


export interface ErrorDetails {
  field?: string;
  value?: unknown;
  expected?: unknown;
  [key: string]: any;
}


export class CustomError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: ErrorDetails;
  readonly cause?: unknown;

  private constructor(
    statusCode: number,
    message: string,
    code: string,
    details?: ErrorDetails,
    cause?: unknown,
  ) {
    super(message, { cause });
    Object.setPrototypeOf(this, new.target.prototype);

    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.cause = cause;
  }

  static badRequest(
    msg = getReasonPhrase(StatusCodes.BAD_REQUEST),
    details?: ErrorDetails,
    cause?: unknown,
  ) {
    return new CustomError(StatusCodes.BAD_REQUEST, msg, 'BAD_REQUEST', details, cause);
  }

  static unauthorized(
    msg = getReasonPhrase(StatusCodes.UNAUTHORIZED),
    details?: ErrorDetails,
    cause?: unknown,
  ) {
    return new CustomError(StatusCodes.UNAUTHORIZED, msg, 'UNAUTHORIZED', details, cause);
  }

  static forbidden(
    msg = getReasonPhrase(StatusCodes.FORBIDDEN),
    details?: ErrorDetails,
    cause?: unknown,
  ) {
    return new CustomError(StatusCodes.FORBIDDEN, msg, 'FORBIDDEN', details, cause);
  }

  static notFound(
    msg = getReasonPhrase(StatusCodes.NOT_FOUND),
    details?: ErrorDetails,
    cause?: unknown,
  ) {
    return new CustomError(StatusCodes.NOT_FOUND, msg, 'NOT_FOUND', details, cause);
  }

  static conflict(
    msg = getReasonPhrase(StatusCodes.CONFLICT),
    details?: ErrorDetails,
    cause?: unknown,
  ) {
    return new CustomError(StatusCodes.CONFLICT, msg, 'CONFLICT', details, cause);
  }

  static internal(
    msg = getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
    details?: ErrorDetails,
    cause?: unknown,
  ) {
    return new CustomError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      msg,
      'INTERNAL_ERROR',
      details,
      cause,
    );
  }

  static fromStatus(
    status: number,
    msg = getReasonPhrase(status as StatusCodes) ?? 'ERROR',
    details?: ErrorDetails,
    cause?: unknown,
  ): CustomError {
    switch (status) {
      case StatusCodes.BAD_REQUEST: return this.badRequest(msg, details, cause);
      case StatusCodes.UNAUTHORIZED: return this.unauthorized(msg, details, cause);
      case StatusCodes.FORBIDDEN: return this.forbidden(msg, details, cause);
      case StatusCodes.NOT_FOUND: return this.notFound(msg, details, cause);
      case StatusCodes.CONFLICT: return this.conflict(msg, details, cause);
      default:
        return new CustomError(status, msg, `HTTP_${status}`, details, cause);
    }
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

export const isCustomError = (e: unknown): e is CustomError => e instanceof CustomError;
