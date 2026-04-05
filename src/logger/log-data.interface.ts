export interface LogData {
  requestParams: any;
  requestQuery: any;
  requestUrl: string;
  requestBody: any;
  requestPath: string;
  requestMethod: string;
  cause: Error;
  stack?: string;
}
