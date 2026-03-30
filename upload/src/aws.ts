import { S3 } from "aws-sdk";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// fileName => output/9823/src/App.jsx
// filePath => Users/sanyam/vercel/dist/output/9823/src/App.jsx
const config = {
  bucket: `${process.env.bucket_name!}`,
};
const s3 = new S3({
  credentials: {
    accessKeyId: `${process.env.accessKeyId!}`,
    secretAccessKey: `${process.env.secretAccessKey!}`,
  },
  endpoint: `${process.env.bucket_endpoint}`,
  region: "ap-northeast-1",
  s3ForcePathStyle: true,
});

export const uploadFile = async (fileName: string, localFilePath: string) => {
  console.log("called");
  const fileContent = fs.readFileSync(localFilePath);
  const response = await s3
    .upload({
      Body: fileContent,
      Bucket: config.bucket,
      Key: fileName,
    })
    .promise();
  console.log(response);
};
