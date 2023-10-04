import { APIGatewayProxyEvent } from 'aws-lambda';
import { books } from '../../constants';
import { AppError } from '@libs/appError';
import { middyfy } from '@libs/lambda';

const getProductsById = async (event: APIGatewayProxyEvent):Promise<Object> => {
  const pathParameters = event.pathParameters;

  if (pathParameters) {
    const productId = pathParameters.productId;
    const book = books.find(({id}) => id === Number(productId));
    if (book) {
      return book;
    } else { throw new AppError('Book not found', 404); }
  } else { throw new AppError('No query parameters provided', 400); }
};

export default getProductsById;
export const main = middyfy(getProductsById);
