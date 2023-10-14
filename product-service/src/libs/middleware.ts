
import middy from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';

import { formatJSONResponse } from './api-gateway';
import { AppError } from './appError';

export const apiGatewayResponseMiddleware = (options: { enableErrorLogger?: boolean } = {}) => {

  const after: middy.MiddlewareFn<APIGatewayProxyEvent> = async (request): Promise<void> => {
    if (!request.event?.httpMethod || request.response === undefined || request.response === null) {
      return;
    }

    const existingKeys = Object.keys(request.response);
    const isHttpResponse = existingKeys.includes('statusCode')
      && existingKeys.includes('headers')
      && existingKeys.includes('body');

    console.log({isHttpResponse});

    if (isHttpResponse) {
      return;
    }

    request.response = formatJSONResponse(request.response);
  }

  const onError: middy.MiddlewareFn<APIGatewayProxyEvent> = async (request): Promise<void> => {
    const { error } = request;
    console.log('err = ', error);
    let statusCode = 500;

    if (error instanceof AppError) {
      statusCode = error.statusCode;
    }

    if (options.enableErrorLogger) {
      console.error(error);
    }

    request.response = formatJSONResponse({ message: error.message }, statusCode);
  }

  return {
    after,
    onError,
  };
}