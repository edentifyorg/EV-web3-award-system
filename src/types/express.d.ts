//TODO - we will need this type potentially if we want to extend Express Request object
declare namespace Express {
  export interface Request {
    user?: {
      sub: string;
      refreshToken: string;
    };
  }
}
