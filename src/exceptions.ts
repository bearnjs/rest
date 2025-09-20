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
/** Internal Server Error exception.
 * @param message @type {string} - The message of the exception.
 * @param payload @type {unknown} - The payload of the exception.
 */
export class InternalServerErrorException extends HttpException {
  constructor(message = 'Internal Server Error', payload?: unknown) {
    super(500, message, payload);
  }
}
