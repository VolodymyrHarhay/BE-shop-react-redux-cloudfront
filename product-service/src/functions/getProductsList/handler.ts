import { DynamoDB } from 'aws-sdk';
import { middyfy } from '@libs/lambda';
import { productsTableName } from '../../constants';
import { stocksTableName } from '../../constants'

const docClient = new DynamoDB.DocumentClient();

const getProductsList = async ():Promise<Object[]> => {

  // Query the Products table
  const productsParams = {
    TableName: productsTableName,
  };
  const productsData = await docClient.scan(productsParams).promise();
  const books = productsData.Items;
  
  // Query the Stocks table
  const stocksParams = {
    TableName: stocksTableName,
  };
  const stocksData = await docClient.scan(stocksParams).promise();
  const stocks = stocksData.Items;

  // Perform the join operation based on the foreign key relationship
  const result = books.map(book => {
    const stock = stocks.find(stock => stock.product_id === book.id);
    return {
      ...book,
      count: stock ? stock.count : 0,
    };
  });

  return result;
};
export default getProductsList;
export const main = middyfy(getProductsList);
