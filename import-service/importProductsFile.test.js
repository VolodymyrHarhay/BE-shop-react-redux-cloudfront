const { importProductsFile } = require('./handler'); // Replace with the correct path to your Lambda function
const AWS = require('aws-sdk');
const awsSdkMock = require('aws-sdk-mock');

describe('importProductsFile Lambda Function', () => {
  beforeAll(() => {
    awsSdkMock.mock('S3', 'getSignedUrlPromise', (operation, params) => {
      return Promise.resolve(`https://example.com/s3-signed-url/${params.Key}`);
    });
  });

  afterAll(() => {
    awsSdkMock.restore('S3', 'getSignedUrlPromise');
  });

  it('should return a signed URL when given a valid name', async () => {
    const event = {
      queryStringParameters: {
        name: 'example.csv',
      },
    };

    const response = await importProductsFile(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toHaveProperty('signedUrl');
    expect(JSON.parse(response.body).signedUrl).toMatch(/(uploaded\/example)/i)
  });

  it('should return a 400 status code when name is missing', async () => {
    const event = {
      queryStringParameters: {},
    };

    const response = await importProductsFile(event);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toHaveProperty('message', 'Name parameter is required.');
  });
});
