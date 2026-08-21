import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.APP_AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
  }
});

const BUCKET = process.env.APP_AWS_S3_BUCKET_NAME;

async function checkS3() {
  const prefixes = ['blog', 'blogs', 'images/blog', 'uploads/blog', 'blog-images'];
  for (const prefix of prefixes) {
    try {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: prefix
      });
      const response = await s3.send(command);
      if (response.Contents && response.Contents.length > 0) {
        console.log(`Found ${response.Contents.length} objects under prefix "${prefix}":`);
        for (const item of response.Contents) {
          console.log(`- ${item.Key} (${item.Size} bytes, modified ${item.LastModified})`);
        }
      } else {
        console.log(`No objects found under prefix "${prefix}"`);
      }
    } catch (e) {
      console.log(`Error checking prefix "${prefix}": ${e.message}`);
    }
  }
}

checkS3();
