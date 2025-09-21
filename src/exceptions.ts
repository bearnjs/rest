/** Base HTTP exception carrying a status code and optional payload. */
export class HttpException extends Error {
  public readonly status: number;
  public readonly payload?: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}
/** Bad Request exception.
 * @param message @type {string} - The message of the exception.
 * @param payload @type {unknown} - The payload of the exception.
 */
export class BadRequestException extends HttpException {
  constructor(message = 'Bad Request', payload?: unknown) {
    super(400, message, payload);
  }
}
/** Unauthorized exception.
 * @param message @type {string} - The message of the exception.
 * @param payload @type {unknown} - The payload of the exception.
 */
export class UnauthorizedException extends HttpException {
  constructor(message = 'Unauthorized', payload?: unknown) {
    super(401, message, payload);
  }
}
/** Forbidden exception.
 * @param message @type {string} - The message of the exception.
 * @param payload @type {unknown} - The payload of the exception.
 */
export class ForbiddenException extends HttpException {
  constructor(message = 'Forbidden', payload?: unknown) {
    super(403, message, payload);
  }
}
/** Not Found exception.
 * @param message @type {string} - The message of the exception.
 * @param payload @type {unknown} - The payload of the exception.
 */
export class NotFoundException extends HttpException {
  constructor(message = 'Not Found', payload?: unknown) {
    super(404, message, payload);
  }
}
/** Method Not Allowed exception.
 * @param message @type {string} - The message of the exception.
 * @param payload @type {unknown} - The payload of the exception.
 */
export class MethodNotAllowedException extends HttpException {
  constructor(message = 'Method Not Allowed', payload?: unknown) {
    super(405, message, payload);
  }
}
/** Not Acceptable exception.
 * @param message @type {string} - The message of the exception.
 * @param payload @type {unknown} - The payload of the exception.
 */
export class NotAcceptableException extends HttpException {
  constructor(message = 'Not Acceptable', payload?: unknown) {
    super(406, message, payload);
  }
}
/** Conflict exception.
 * @param message @type {string} - The message of the exception.
 * @param payload @type {unknown} - The payload of the exception.
 */
export class ConflictException extends HttpException {
  constructor(message = 'Conflict', payload?: unknown) {
    super(409, message, payload);
  }
}
/** Gone exception.
 * @param message @type {string} - The message of the exception.
 * @param payload @type {unknown} - The payload of the exception.
 */
export class GoneException extends HttpException {
  constructor(message = 'Gone', payload?: unknown) {
    super(410, message, payload);
  }
}
/** Unprocessable Entity exception.
 * @param message @type {string} - The message of the exception.
 * @param payload @type {unknown} - The payload of the exception.
 */
export class UnprocessableEntityException extends HttpException {
  constructor(message = 'Unprocessable Entity', payload?: unknown) {
    super(422, message, payload);
  }
}
/** Internal Server Error exception.
 * @param message @type {string} - The message of the exception.
 * @param payload @type {unknown} - The payload of the exception.
 */
export class InternalServerErrorException extends HttpException {
  constructor(message = 'Internal Server Error', payload?: unknown) {
    super(500, message, payload);
  }
}
/** Bad Gateway exception.
 * @param message @type {string} - The message of the exception.
 * @param payload @type {unknown} - The payload of the exception.
 */
export class BadGatewayException extends HttpException {
  constructor(message = 'Bad Gateway', payload?: unknown) {
    super(502, message, payload);
  }
}
/** Service Unavailable exception.
 * @param message @type {string} - The message of the exception.
 * @param payload @type {unknown} - The payload of the exception.
 */
export class ServiceUnavailableException extends HttpException {
  constructor(message = 'Service Unavailable', payload?: unknown) {
    super(503, message, payload);
  }
}
/** Gateway Timeout exception.
 * @param message @type {string} - The message of the exception.
 * @param payload @type {unknown} - The payload of the exception.
 */
export class GatewayTimeoutException extends HttpException {
  constructor(message = 'Gateway Timeout', payload?: unknown) {
    super(504, message, payload);
  }
}
