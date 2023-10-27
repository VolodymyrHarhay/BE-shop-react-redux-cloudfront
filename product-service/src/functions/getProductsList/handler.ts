import { middyfy } from '@libs/lambda';
import { productsTableName, stocksTableName } from '../../constants';
import { scanWithPagination } from '../../utils';

const getProductsList = async ():Promise<Object[]> => {
  // Fetch products and stocks with pagination
  const books = await scanWithPagination(productsTableName);
  const stocks = await scanWithPagination(stocksTableName);

  // Perform the join operation based on the foreign key relationship
  const result = books.map(book => {
    const stock = stocks.find(stock => stock.product_id === book.id);
    return {
      ...book,
      count: stock ? stock.count : 0,
    };
  });
  result.sort((x, y) => x.title.localeCompare(y.title));
  return result;
};
export default getProductsList;
export const main = middyfy(getProductsList);
