'use strict';
const AWS = require('aws-sdk');
const csvParser = require('csv-parser');

const uploadedFolder = 'uploaded';
const parsedFolder = 'parsed';

const s3 = new AWS.S3();
const sqs = new AWS.SQS();

module.exports = {
  importProductsFile: async (event) => {
    console.log({event});
    const { name } = event?.queryStringParameters || {};
    if (!name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Name parameter is required.' }),
      };
    }

    const key = `${uploadedFolder}/${name}`;
    const params = {
      Bucket: 'import-service-bucket-lab',
      Key: key,
      Expires: 60, // URL expiration time in seconds
      ContentType: 'text/csv'
    };

    try {
      const signedUrl = await s3.getSignedUrlPromise('putObject', params);

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Headers" : "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE,PUT"
        },
        body: JSON.stringify({ signedUrl }),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error generating Signed URL.' }),
      };
    }
  },
  importFileParser: async (event) => {
    try {
      const record = event.Records[0]; // Assuming only one record is processed at a time
      const bucket = record.s3.bucket.name;
      const key = record.s3.object.key;
  
      console.log(`Processing S3 object: s3://${bucket}/${key}`);
  
      const records = await processCsvFile(bucket, key);
      console.log({records});
  
      // Copy the file to the "parsed" folder
      const parsedKey = `${parsedFolder}/${key.replace('uploaded/', '')}`;
      await s3.copyObject({ Bucket: bucket, CopySource: `${bucket}/${key}`, Key: parsedKey }).promise();
  
      // Delete the file from the "uploaded" folder
      await s3.deleteObject({ Bucket: bucket, Key: key }).promise();
  
      console.log(`File moved to the "parsed" folder and deleted from "uploaded"`);
  
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'File processed successfully.', records }),
        headers: {
          "Access-Control-Allow-Headers" : "Content-Type",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE,PUT"
        },
      };
    } catch (err) {
      console.log('Error: ', err);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: err?.message || 'Internal server error.' }),
      };
    }
  }
};

async function processCsvFile(bucket, key) {
  return new Promise((resolve, reject) => {
    console.log('File read from S3.');
    const records = [];

    const readStream = s3.getObject({ Bucket: bucket, Key: key }).createReadStream();
    readStream
      .pipe(csvParser({ separator: ';' }))
      .on('data', async(data) => {
        data.price = Number(data.price);
        data.id = data.id;
        records.push(data);
        await sqs.sendMessage({
          QueueUrl: process.env.SQS_URL,
          MessageBody: JSON.stringify(data),
        }, (err, data) => {
          if (err) console.log(err, err.stack);
          console.log('send message: ', data);
        }).promise();
      })
      .on('end', () => {
        console.log('Finished processing S3 file.');
        resolve(records);
      })
      .on('error', (err) => {
        console.error('Error reading S3 file:', err);
        reject(err);
      });
  });
}

