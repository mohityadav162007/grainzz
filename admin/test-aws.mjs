import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.APP_AWS_S3_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY || '',
  },
});

async function check() {
  try {
    await s3.send(new ListBucketsCommand({}));
    console.log("AWS S3 Credentials are VALID!");
  } catch (error) {
    console.error("AWS ERROR:", error.name, error.message);
  }
}
check();
