import path from "path";
import { S3 } from "aws-sdk";
import fs from "fs";
import { getAllFiles } from "./utils";
import dotenv from "dotenv";
dotenv.config();
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

export async function downloadS3Folder(prefix: string) {
  const allFiles = await s3
    .listObjectsV2({
      Bucket: config.bucket,
      Prefix: prefix,
    })
    .promise();
  console.log("all files", allFiles);

  const allPromises =
    allFiles.Contents?.map(async ({ Key }) => {
      return new Promise(async (resolve) => {
        if (!Key) {
          resolve("");
          console.log("returned");
          return;
        }
        const finalOutputPath = path.join(__dirname, Key);
        const outputFile = fs.createWriteStream(finalOutputPath);
        const dirname = path.dirname(finalOutputPath);
        if (!fs.existsSync(dirname)) {
          fs.mkdirSync(dirname, { recursive: true });
        }
        s3.getObject({
          Bucket: config.bucket,
          Key,
        })
          .createReadStream()
          .pipe(outputFile)
          .on("finish", () => {
            resolve("");
            console.log("directory pushed");
          });
      });
    }) || [];
  await Promise.all(allPromises?.filter((x) => x !== undefined));
}

export const uploadFile = async (fileName: string, localFilePath: string) => {
  console.log("called");
  try {
  } catch (error) {}
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

export function copyFinalDist(id: string) {
  const folderPath = path.join(__dirname, `output/${id}/dist`);
  const allFiles = getAllFiles(folderPath);
  allFiles.forEach((file) => {
    uploadFile(`dist/${id}/` + file.slice(folderPath.length + 1), file);
  });
}
