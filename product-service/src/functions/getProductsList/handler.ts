import { books } from '../../constants';
import { middyfy } from '@libs/lambda';

const getProductsList = async ():Promise<Object[]> => {
  return books;
};

export const main = middyfy(getProductsList);