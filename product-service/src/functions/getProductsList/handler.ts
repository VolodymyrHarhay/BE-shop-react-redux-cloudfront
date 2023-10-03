import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { books } from '../../constants';
import { formatJSONResponse } from '@libs/api-gateway';


const getProductsList = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers" : "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE"
    },
    body: JSON.stringify(books)
  };
  // return formatJSONResponse({
  //   message: `Hello ${event.body.name}, welcome to the exciting Serverless world!`,
  //   event,
  // });
};

export const main = getProductsList;
