import type { AWS } from '@serverless/typescript';
import getProductsList from '@functions/getProductsList';
import getProductsById from '@functions/getProductsById';

const serverlessConfiguration: AWS = {
  service: 'product-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline', 'serverless-aws-documentation'],
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
    },
  },
  // import the function via paths
  functions: { getProductsList, getProductsById },
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
      models: [
        {
          name: 'Product',
          contentType: 'application/json',
          schema: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              title: { type: 'string' },
              description: { type: 'string' },
              price: { type: 'number' },
              count: { type: 'number' }
            },
          },
        },
        {
          name: 'MyError',
          contentType: 'application/json',
          schema: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      ],
      paths: {
        '/products': {
          get: {
            responses: {
              200: {
                description: 'A list of products',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/models/Product',
                    },
                  },
                },
              },
            },
          },
        },
        '/products/{productId}': {
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
                      $ref: '#/components/models/Product',
                    },
                  },
                },
              },
              404: {
                description: 'Product not found',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/models/MyError',
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
