import { v4 } from 'uuid';
import { DynamoDB } from 'aws-sdk';
const docClient = new DynamoDB.DocumentClient();
export const generateUUID = () => {
  return v4();
};

export const scanWithPagination = async (tableName: string, params = {}) => {
  const items = [];
  let lastEvaluatedKey;

  do {
    const result = await docClient.scan({
      TableName: tableName,
      ...params,
      ExclusiveStartKey: lastEvaluatedKey,
    }).promise();

    items.push(...result.Items);
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return items;
};