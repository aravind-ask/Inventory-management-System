export class BadRequestError extends Error {
  status: number;
  errors?: any;

  constructor(message: string, errors?: any) {
    super(message);
    this.status = 400;
    this.errors = errors;
  }
}

export class UnauthorizedError extends Error {
  status: number;

  constructor(message: string) {
    super(message);
    this.status = 401;
  }
}

export class NotFoundError extends Error {
  status: number;

  constructor(message: string) {
    super(message);
    this.status = 404;
  }
}
