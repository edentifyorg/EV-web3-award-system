export class UnexposableException extends Error {
  readonly cause: Error;

  constructor(message: string, cause: Error) {
    super(message);
    this.cause = cause;
  }

  public getCause(): Error {
    return this.cause;
  }
}
