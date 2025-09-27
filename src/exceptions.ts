/**
 * Represents a base HTTP exception with a status code and optional payload.
 * @class
 * @extends Error
 */
export class HttpException extends Error {
  /**
   * @type {number}
   * @readonly
   * @public
   * The HTTP status code associated with the exception.
   */
  public readonly status: number;

  /**
   * @type {unknown}
   * @readonly
   * @public
   * An optional payload providing additional information about the exception.
   */
  public readonly payload?: unknown;

  /**
   * Creates an instance of HttpException.
   * @param {number} status - The HTTP status code.
   * @param {string} message - A descriptive message for the exception.
   * @param {unknown} [payload] - Optional additional data related to the exception.
   */
  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

/**
 * Exception for HTTP 400 Bad Request errors.
 * @class
 * @augments HttpException
 */
export class BadRequestException extends HttpException {
  /**
   * Constructs a BadRequestException.
   * @param {string} [message='Bad Request'] - A descriptive message for the exception.
   * @param {unknown} [payload] - Optional additional data related to the exception.
   */
  constructor(message = 'Bad Request', payload?: unknown) {
    super(400, message, payload);
  }
}

/**
 * Exception for HTTP 401 Unauthorized errors.
 * @class
 * @augments HttpException
 */
export class UnauthorizedException extends HttpException {
  /**
   * Constructs an UnauthorizedException.
   * @param {string} [message='Unauthorized'] - A descriptive message for the exception.
   * @param {unknown} [payload] - Optional additional data related to the exception.
   */
  constructor(message = 'Unauthorized', payload?: unknown) {
    super(401, message, payload);
  }
}

/**
 * Exception for HTTP 403 Forbidden errors.
 * @class
 * @augments HttpException
 */
export class ForbiddenException extends HttpException {
  /**
   * Constructs a ForbiddenException.
   * @param {string} [message='Forbidden'] - A descriptive message for the exception.
   * @param {unknown} [payload] - Optional additional data related to the exception.
   */
  constructor(message = 'Forbidden', payload?: unknown) {
    super(403, message, payload);
  }
}

/**
 * Exception for HTTP 404 Not Found errors.
 * @class
 * @augments HttpException
 */
export class NotFoundException extends HttpException {
  /**
   * Constructs a NotFoundException.
   * @param {string} [message='Not Found'] - A descriptive message for the exception.
   * @param {unknown} [payload] - Optional additional data related to the exception.
   */
  constructor(message = 'Not Found', payload?: unknown) {
    super(404, message, payload);
  }
}

/**
 * Exception for HTTP 405 Method Not Allowed errors.
 * @class
 * @augments HttpException
 */
export class MethodNotAllowedException extends HttpException {
  /**
   * Constructs a MethodNotAllowedException.
   * @param {string} [message='Method Not Allowed'] - A descriptive message for the exception.
   * @param {unknown} [payload] - Optional additional data related to the exception.
   */
  constructor(message = 'Method Not Allowed', payload?: unknown) {
    super(405, message, payload);
  }
}

/**
 * Exception for HTTP 406 Not Acceptable errors.
 * @class
 * @augments HttpException
 */
export class NotAcceptableException extends HttpException {
  /**
   * Constructs a NotAcceptableException.
   * @param {string} [message='Not Acceptable'] - A descriptive message for the exception.
   * @param {unknown} [payload] - Optional additional data related to the exception.
   */
  constructor(message = 'Not Acceptable', payload?: unknown) {
    super(406, message, payload);
  }
}

/**
 * Exception for HTTP 409 Conflict errors.
 * @class
 * @augments HttpException
 */
export class ConflictException extends HttpException {
  /**
   * Constructs a ConflictException.
   * @param {string} [message='Conflict'] - A descriptive message for the exception.
   * @param {unknown} [payload] - Optional additional data related to the exception.
   */
  constructor(message = 'Conflict', payload?: unknown) {
    super(409, message, payload);
  }
}

/**
 * Exception for HTTP 410 Gone errors.
 * @class
 * @augments HttpException
 */
export class GoneException extends HttpException {
  /**
   * Constructs a GoneException.
   * @param {string} [message='Gone'] - A descriptive message for the exception.
   * @param {unknown} [payload] - Optional additional data related to the exception.
   */
  constructor(message = 'Gone', payload?: unknown) {
    super(410, message, payload);
  }
}

/**
 * Exception for HTTP 422 Unprocessable Entity errors.
 * @class
 * @augments HttpException
 */
export class UnprocessableEntityException extends HttpException {
  /**
   * Constructs an UnprocessableEntityException.
   * @param {string} [message='Unprocessable Entity'] - A descriptive message for the exception.
   * @param {unknown} [payload] - Optional additional data related to the exception.
   */
  constructor(message = 'Unprocessable Entity', payload?: unknown) {
    super(422, message, payload);
  }
}

/**
 * Exception for HTTP 500 Internal Server Error errors.
 * @class
 * @augments HttpException
 */
export class InternalServerErrorException extends HttpException {
  /**
   * Constructs an InternalServerErrorException.
   * @param {string} [message='Internal Server Error'] - A descriptive message for the exception.
   * @param {unknown} [payload] - Optional additional data related to the exception.
   */
  constructor(message = 'Internal Server Error', payload?: unknown) {
    super(500, message, payload);
  }
}

/**
 * Exception for HTTP 502 Bad Gateway errors.
 * @class
 * @augments HttpException
 */
export class BadGatewayException extends HttpException {
  /**
   * Constructs a BadGatewayException.
   * @param {string} [message='Bad Gateway'] - A descriptive message for the exception.
   * @param {unknown} [payload] - Optional additional data related to the exception.
   */
  constructor(message = 'Bad Gateway', payload?: unknown) {
    super(502, message, payload);
  }
}

/**
 * Exception for HTTP 503 Service Unavailable errors.
 * @class
 * @augments HttpException
 */
export class ServiceUnavailableException extends HttpException {
  /**
   * Constructs a ServiceUnavailableException.
   * @param {string} [message='Service Unavailable'] - A descriptive message for the exception.
   * @param {unknown} [payload] - Optional additional data related to the exception.
   */
  constructor(message = 'Service Unavailable', payload?: unknown) {
    super(503, message, payload);
  }
}

/**
 * Exception for HTTP 504 Gateway Timeout errors.
 * @class
 * @augments HttpException
 */
export class GatewayTimeoutException extends HttpException {
  /**
   * Constructs a GatewayTimeoutException.
   * @param {string} [message='Gateway Timeout'] - A descriptive message for the exception.
   * @param {unknown} [payload] - Optional additional data related to the exception.
   */
  constructor(message = 'Gateway Timeout', payload?: unknown) {
    super(504, message, payload);
  }
}
