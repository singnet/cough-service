import dotenv from "dotenv";
import { AwsConfig } from "../config/aws";
import aws from "aws-sdk";

dotenv.config();

aws.config.update({
  region: AwsConfig.region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_KEY_SECRET,
  },
});

const s3Client = new aws.S3();
const Bucket = process.env.AWS_BUCKET_NAME;

export const signedUrl = (Key, Expires = 60 * 60) => {
  return s3Client.getSignedUrl("getObject", { Bucket, Key, Expires });
};

export const uploadFile = async (filePath, fileName, fileBody) => {
  const file = `${filePath}/${fileName}`;

  try {
    const payload = {
      Bucket,
      Key: file,
      Body: fileBody,
    };
    await s3Client.putObject(payload).promise();
    return signedUrl(file);
  } catch (error) {
    throw error;
  }
};
