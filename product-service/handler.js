'use strict';

const books = [
  {
    id: 1,
    title: 'Book 1',
    desctiption: 'Some description 1',
    price: 100,
    count: 10
  },
  {
    id: 2,
    title: 'Book 2',
    desctiption: 'Some description 2',
    price: 200,
    count: 20
  },
  {
    id: 3,
    title: 'Book 3',
    desctiption: 'Some description 3',
    price: 300,
    count: 30
  },
  {
    id: 4,
    title: 'Book 4',
    desctiption: 'Some description 4',
    price: 400,
    count: 40
  },
  {
    id: 5,
    title: 'Book 5',
    desctiption: 'Some description 5',
    price: 500,
    count: 50
  },
  {
    id: 6,
    title: 'Book 6',
    desctiption: 'Some description 6',
    price: 600
  }
];

module.exports.getProductsList = async () => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers" : "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE"
    },
    body: JSON.stringify(books)
  };
};
