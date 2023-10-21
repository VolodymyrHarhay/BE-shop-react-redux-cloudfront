import { DynamoDB } from 'aws-sdk';
import { middyfy } from '@libs/lambda';
import { AppError } from '@libs/appError';
import { productsTableName, stocksTableName } from '../../constants';
import { generateUUID } from '../../utils';
import { APIGatewayProxyResult } from 'aws-lambda';

const docClient = new DynamoDB.DocumentClient();

const createProduct = async (event: any): Promise<APIGatewayProxyResult> => {
  const { title, description, price, count } = event?.body || {};

  if (!title || !description || !price || !count) {
    throw new AppError('Invalid product data. Please provide title, description, price and count.', 400);
  }

  const productItem = {
    id: generateUUID(),
    title,
    description,
    price: price,
  };

  const stockItem = {
    product_id: productItem.id,
    count
  };

  const transactParams = {
    TransactItems: [
      {
        Put: {
          TableName: stocksTableName,
          Item: stockItem,
          ConditionExpression: 'attribute_not_exists(product_id)', // Prevent overwriting existing stock
        },
      },
      {
        Put: {
          TableName: productsTableName,
          Item: productItem,
          ConditionExpression: 'attribute_not_exists(id)', // Prevent overwriting existing product
        },
      },
    ],
  };

  await docClient.transactWrite(transactParams).promise();
  return {
    statusCode: 201,
    body: JSON.stringify({
      message: 'Product and stock created successfully',
    }),
  };
};

export default createProduct;
export const main = middyfy(createProduct);
