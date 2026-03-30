import express from "express";
import { S3 } from "aws-sdk";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const app = express();
app.use(cors());

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

app.get("/*", async (req, res) => {
  //id.vercelorsomething.com //to extract id
  const host = req.hostname;

  const id = host.split(".")[0];
  let filePath = req.path;

  if (filePath === "/" || filePath === "") {
    filePath = "/index.html";
  }

  try {
    const contents = await s3
      .getObject({
        Bucket: config.bucket,
        Key: `dist/${id}${filePath}`,
      })
      .promise();

    const type = filePath.endsWith("html")
      ? "text/html"
      : filePath.endsWith("css")
      ? "text/css"
      : "application/javascript";
    res.set("Content-type", type);
    res.send(contents.Body);
    console.log("sent");
  } catch (error) {
    res.send({ error: error });
  }
});

app.listen(process.env.PORT);
