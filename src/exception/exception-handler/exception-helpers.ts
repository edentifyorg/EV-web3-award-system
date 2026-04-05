import { ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';

export function extractRequestAndResponse(host: ArgumentsHost): {
  req: Request;
  res: Response;
} {
  const ctx = host.switchToHttp();
  return {
    res: ctx.getResponse<Response>(),
    req: ctx.getRequest<Request>(),
  };
}

export function generateStandardLoggingParams(req: Request): {
  requestParams: any;
  requestQuery: any;
  requestUrl: string;
  requestBaseUrl: string;
  requestBody: any;
  requestPath: string;
  requestMethod: string;
} {
  const reqBodyClone = Object.assign({}, req.body);
  if (reqBodyClone.password !== undefined && reqBodyClone.password !== null) {
    reqBodyClone.password = '*****';
  }

  return {
    requestParams: req.params,
    requestQuery: req.query,
    requestBody: reqBodyClone,
    requestPath: req.path,
    requestUrl: req.url,
    requestBaseUrl: req.baseUrl,
    requestMethod: req.method,
  };
}
