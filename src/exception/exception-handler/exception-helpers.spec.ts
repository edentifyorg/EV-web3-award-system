import { ArgumentsHost } from '@nestjs/common';
import * as ExceptionHelpers from './exception-helpers';
import { Request } from 'express';

describe('Exception helper functions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('extractRequestAndResponse', () => {
    it('should properly extract and return request and response objects', () => {
      const mockRequest = 'mockRequest';
      const mockResponse = 'mockResponse';
      const mockGetResponse = jest.fn(() => mockResponse);
      const mockGetRequest = jest.fn(() => mockRequest);
      const mockSwitchToHttp = jest.fn(() => ({
        getResponse: mockGetResponse,
        getRequest: mockGetRequest,
      }));

      const mockHostArgument = {
        switchToHttp: mockSwitchToHttp,
      } as unknown as ArgumentsHost;

      const result =
        ExceptionHelpers.extractRequestAndResponse(mockHostArgument);

      expect(mockSwitchToHttp).toHaveBeenCalledTimes(1);

      expect(mockGetResponse).toHaveBeenCalledTimes(1);
      expect(mockGetRequest).toHaveBeenCalledTimes(1);

      expect(result.res).toBe(mockResponse);
      expect(result.req).toBe(mockRequest);
    });
  });

  describe('generateStandardLoggingParams', () => {
    it('should properly generate standard logging parameters', () => {
      const mockAssign = jest.spyOn(Object, 'assign');
      const mockRequestObject = {
        params: 'mockParams',
        query: 'mockQuery',
        body: 'mockBody',
        path: 'mockPath',
        url: 'mockUrl',
        baseUrl: 'mockBaseUrl',
        method: 'mockMethod',
      } as unknown as Request;

      mockAssign.mockReturnValueOnce(mockRequestObject.body);

      const result =
        ExceptionHelpers.generateStandardLoggingParams(mockRequestObject);

      expect(mockAssign).toHaveBeenCalledTimes(1);
      expect(mockAssign).toHaveBeenCalledWith({}, mockRequestObject.body);

      expect(result).toEqual({
        requestParams: mockRequestObject.params,
        requestQuery: mockRequestObject.query,
        requestBody: mockRequestObject.body,
        requestPath: mockRequestObject.path,
        requestUrl: mockRequestObject.url,
        requestBaseUrl: mockRequestObject.baseUrl,
        requestMethod: mockRequestObject.method,
      });
    });

    it('should properly mask password property of request body if password property exists', () => {
      const mockRequestObject = {
        body: {
          password: 'mockPassword',
        },
      } as unknown as Request;

      const result =
        ExceptionHelpers.generateStandardLoggingParams(mockRequestObject);

      expect(result.requestBody.password).toBeDefined();
      expect(result.requestBody.password).toEqual('*****');
    });
  });
});
