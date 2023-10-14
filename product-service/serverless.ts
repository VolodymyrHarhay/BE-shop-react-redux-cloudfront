require('dotenv').config();
import type { AWS } from '@serverless/typescript';
import getProductsList from '@functions/getProductsList';
import getProductsById from '@functions/getProductsById';
import createProduct from '@functions/createProduct';

const productsTableName = 'Products';
const stocksTableName = 'Stocks';

const serverlessConfiguration: AWS = {
  service: 'product-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline', 'serverless-openapi-documentation'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    stage: 'dev',
    region: 'eu-north-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      DYNAMODB_BOOKS_TABLE: process.env.DYNAMODB_BOOKS_TABLE,
      DYNAMODB_STOCKS_TABLE: process.env.DYNAMODB_STOCKS_TABLE,
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 'dynamodb:Scan',
        Resource: [
          process.env.PRODUCTS_TABLE_ARN,
          process.env.STOCKS_TABLE_ARN
        ],
      },
      {
        Effect: 'Allow',
        Action: 'dynamodb:GetItem',
        Resource: process.env.PRODUCTS_TABLE_ARN
      },
      {
        Effect: 'Allow',
        Action: 'dynamodb:PutItem',
        Resource: [
          process.env.PRODUCTS_TABLE_ARN,
          process.env.STOCKS_TABLE_ARN
        ]
      }
    ]
  },
  functions: { getProductsList, getProductsById, createProduct },
  resources: {
    Resources: {
      ProductsDynamoDBTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: productsTableName,
          AttributeDefinitions: [
            {
              AttributeName: 'id',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
      },
      StocksDynamoDBTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: stocksTableName,
          AttributeDefinitions: [
            {
              AttributeName: 'product_id',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'product_id',
              KeyType: 'HASH',
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
      },
    },
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    // Use the 'serverless-aws-documentation' plugin's 'documentation' configuration
    documentation: {
      api: {
        info: {
          title: 'Product Service API',
          version: '1.0.0',
        },
      },
      models: {
        Product: {
          contentType: 'application/json',
          schema: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              price: { type: 'number' },
            },
          },
        },
        ProductList: {
          contentType: 'application/json',
          name: 'ProductListModel',
          schema: {
            type: 'array',
            items: {
              $ref: 'ProductModel',
            },
          },
        },
        ProductCreateRequest: {
          contentType: 'application/json',
          name: 'ProductCreateRequestModel',
          schema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              price: { type: 'number' },
              count: { type: 'number' },
            },
          },
        },
        MyError: {
          contentType: 'application/json',
          name: 'MyErrorModel',
          schema: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
      paths: {
        '/products': {
          get: {
            summary: 'Get a list of products',
            responses: {
              200: {
                description: 'A list of products',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/custom/documentation/models/ProductList',
                    },
                  },
                },
              },
              500: {
                description: 'Internal Server Error',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/custom/documentation/models/MyError',
                    },
                  },
                },
              },
            },
          },
          post: {
            summary: 'Create a new product',
            description: 'Create a new product in the database.',
            requestBody: {
              description: 'Request body for creating a new product',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/custom/documentation/models/ProductCreateRequest',
                  },
                },
              },
            },
            responses: {
              201: {
                description: 'Product created successfully',
              },
              400: {
                description: 'Bad Request',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/custom/documentation/models/MyError',
                    },
                  },
                },
              },
              500: {
                description: 'Internal Server Error',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/custom/documentation/models/MyError',
                    },
                  },
                },
              },
            },
          },
        },
        '/products/{productId}': {
          summary: 'Get a single product by ID',
          get: {
            parameters: [
              {
                name: 'productId',
                in: 'path',
                required: true,
                schema: {
                  type: 'string',
                },
                description: 'The unique identifier of the product.',
              },
            ],
            responses: {
              200: {
                description: 'A single product',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/custom/documentation/models/Product',
                    },
                  },
                },
              },
              404: {
                description: 'Product not found',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/custom/documentation/models/MyError',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
