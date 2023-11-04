import { SNS } from 'aws-sdk';
import { SQSEvent, SQSHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { productsTableName } from '../../constants';

const dynamoDb = new DynamoDB.DocumentClient();
const sns = new SNS();
const createProduct = async(productData: any) => {
  const params: DynamoDB.DocumentClient.PutItemInput = {
    TableName: productsTableName,
    Item: {
      id: productData.id,
      title: productData.title,
      description: productData.description,
      price: productData.price,
    },
  };
  await dynamoDb.put(params).promise();
}

const catalogBatchProcess: SQSHandler = async (event: SQSEvent) => {
  console.log({event});
  try {
    for (const record of event.Records) {
      const message = JSON.parse(record.body);
      console.log('message = ', message);
      // Process the message and create the corresponding product in the products table
      await createProduct(message);

      console.log('Product created:', message);

      const snsParams = {
        TopicArn: process.env.SNS_ARN,
        Subject: 'Message from AWS',
        Message: JSON.stringify({ message }),
        MessageAttributes: {
          price: {
            DataType: 'Number',
            StringValue: `${message.price}`
          }
        }
      };

      await sns.publish(snsParams).promise();
      console.log('Email sent:', message);
    }
  } catch (error) {
    console.error('Error processing SQS event:', error);
  }
};


export default catalogBatchProcess;
export const main = catalogBatchProcess;
