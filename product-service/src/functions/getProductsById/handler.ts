import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { AppError } from '@libs/appError';
import { middyfy } from '@libs/lambda';
import { productsTableName } from '../../constants';

const docClient = new DynamoDB.DocumentClient();

const getProductsById = async (event: APIGatewayProxyEvent): Promise<any> => {
  const pathParameters = event.pathParameters;

  if (pathParameters?.productId) {
    const productId = pathParameters.productId;
    const params = {
      TableName: productsTableName,
      Key: {
        id: productId,
      },
    };
    const data = await docClient.get(params).promise();
    const book = data?.Item;
    if (book) {
      return book;
    } else { throw new AppError('Book not found', 404); }
  } else { throw new AppError('No query parameters provided', 400); }
};

export default getProductsById;
export const main = middyfy(getProductsById);
