import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { books } from '../../constants';
import { formatJSONResponse } from '@libs/api-gateway';

const getProductsById = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const pathParameters = event.pathParameters;

    if (pathParameters) {
        const productId = pathParameters.productId;
        const book = books.find(({id}) => id === Number(productId));
        return {
          statusCode: 200,
          body: JSON.stringify(book),
        };
    } else {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'No query parameters provided' }),
        };
    }
  // return formatJSONResponse({
  //   message: `Hello ${event.body.name}, welcome to the exciting Serverless world!`,
  //   event,
  // });
};

export const main = getProductsById;
