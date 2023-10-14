import AWS from 'aws-sdk';
import { v4 } from 'uuid';

AWS.config.update({
  region: 'eu-north-1'
});

// Initialize the DynamoDB Document Client
const docClient = new AWS.DynamoDB.DocumentClient();

// Specify the table name
const productsTableName = 'Products';
const stocksTableName = 'Stocks';

// Define sample data to insert into the table
const productsToInsert = [
  {
    id: v4(), // Generate a UUID for the primary key
    title: 'Book 1',
    description: 'Description for Book 1',
    price: 1000,
  },
  {
    id: v4(),
    title: 'Book 2',
    description: 'Description for Book 2',
    price: 1500,
  },
  {
    id: v4(),
    title: 'Book 3',
    description: 'Description for Book 3',
    price: 1500,
  },
  {
    id: v4(),
    title: 'Book 4',
    description: 'Description for Book 4',
    price: 2000,
  },
  {
    id: v4(),
    title: 'Book 5',
    description: 'Description for Book 5',
    price: 2500,
  },
  {
    id: v4(),
    title: 'Book 6',
    description: 'Description for Book 6',
    price: 3000,
  },
  {
    id: v4(),
    title: 'Book 7',
    description: 'Description for Book 7',
    price: 3500,
  },
  {
    id: v4(),
    title: 'Book 8',
    description: 'Description for Book 8',
    price: 4000,
  }
];

const stocksToInsert = [
  { count: 100 }, 
  { count: 200 },
  { count: 300 }, 
  { count: 400 }, 
  { count: 500 }, 
  { count: 600 },
  { count: 700 }, 
  { count: 800 }
];

// Function to fill Stock table
const insertStock = (index, productId) => {
  const stockParams = {
    TableName: stocksTableName,
    Item: { ...stocksToInsert[index], product_id: productId },
  };

  docClient.put(stockParams, (err, data) => {
    if (err) {
      console.error('Error inserting stock:', err);
    } else {
      console.log('Stock inserted successfully:', data);
    }
  });
}


// Function to fill Products and Stock tables
const insertProductAndStock = (product, index) => {
  const productParams = {
    TableName: productsTableName,
    Item: product,
  };

  docClient.put(productParams, (err, data) => {
    if (err) {
      console.error('Error inserting book:', err);
    } else {
      console.log('Book inserted successfully:', data);
    }
  });

  // it has to be here as id in stock is foreign key from product.id
  insertStock(index, product.id);
};

// Function to retrieve data using async/await
const cleanTable = async (tableName) => {
  try {
    const data = await docClient.scan({ TableName: tableName }).promise();
    console.log(data.Items);
    const itemTilte = tableName === 'Products' ? 'Book' : 'Stock';

    data.Items.forEach(item => {
      let deleteParams;
      if (tableName === 'Products') {
        deleteParams = {
          TableName: tableName,
          Key: {
            id: item.id
          },
        }
      } else {
        deleteParams = {
          TableName: tableName,
          Key: {
            product_id: item.product_id
          },
        }
      }
      docClient.delete(deleteParams, (err, data) => {
        if (err) {
          console.error(`Error deleting ${itemTilte}:`, err);
        } else {
          console.log(`${itemTilte} deleted successfully:`, data);
        }
      }).promise();
    });
  } catch (err) {
    console.error(`Error scanning ${tableName} table:`, err);
    throw err;
  }
};

await cleanTable(productsTableName);
await cleanTable(stocksTableName);
productsToInsert.forEach(insertProductAndStock);