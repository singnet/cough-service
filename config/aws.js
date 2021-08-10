import "dotenv/config";
export class AwsConfig {
  static accessKeyId = process.env.AWS_ACCESS_KEY;
  static secretAccessKey = process.env.AWS_ACCESS_SECRET;
  static region = process.env.AWS_REGION;
  static bucketName = process.env.AWS_BUCKET_NAME;
}
