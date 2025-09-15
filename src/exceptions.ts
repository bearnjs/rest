export class HttpException extends Error {
  public readonly status: number;
  public readonly payload?: any;

  constructor(status: number, message: string, payload?: any) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export class BadRequestException extends HttpException {
  constructor(message = 'Bad Request', payload?: any) {
    super(400, message, payload);
  }
}
export class UnauthorizedException extends HttpException {
  constructor(message = 'Unauthorized', payload?: any) {
    super(401, message, payload);
  }
}
export class ForbiddenException extends HttpException {
  constructor(message = 'Forbidden', payload?: any) {
    super(403, message, payload);
  }
}
export class NotFoundException extends HttpException {
  constructor(message = 'Not Found', payload?: any) {
    super(404, message, payload);
  }
}
export class InternalServerErrorException extends HttpException {
  constructor(message = 'Internal Server Error', payload?: any) {
    super(500, message, payload);
  }
}
