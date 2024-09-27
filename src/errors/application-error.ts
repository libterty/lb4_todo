export class ApplicationError extends Error {
  constructor(
    public statusCode: number,
    public name: string,
    public message: string,
    public details?: object,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static notFound(entity?: string): ApplicationError {
    return new ApplicationError(
      404,
      'NotFoundError',
      `${entity || 'Entity'} not found`,
    );
  }

  static badRequest(message: string, details?: object): ApplicationError {
    return new ApplicationError(400, 'BadRequestError', message, details);
  }
}
