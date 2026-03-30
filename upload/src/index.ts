import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate } from "./utils";
import path from "path";
import { getAllFiles } from "./file";
import { uploadFile } from "./aws";
import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const publisher = createClient({
  url: `${process.env.redis_url}`,
});
const subscriber = createClient({
  url: `${process.env.redis_url}`,
});

publisher.on("error", (err) => console.error("Redis publisher error", err));
subscriber.on("error", (err) => console.error("Redis subscriber error", err));

async function initRedis() {
  try {
    await publisher.connect();
    await subscriber.connect();
    console.log("✅ Redis connected");
  } catch (err) {
    console.error("❌ Redis connection failed:", err);
    process.exit(1);
  }
}
initRedis();

app.get("/admin", (req, res) => {
  try {
    res.status(200).json({ "Upload Service": "Working" });
  } catch (error) {
    res.status(401).json({ error: `${error}` });
  }
});

app.post("/deploy", async (req, res) => {
  try {
    const repoUrl = req.body.repoUrl;
    const id = generate();
    await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));
    // put this to S3
    const key = __dirname.split(path.sep).join("/");
    const files = getAllFiles(path.join(key, `output/${id}`));
    console.log(files);
    await Promise.all(
      files.map((file) => uploadFile(file.slice(key.length + 1), file)),
    );
     
    await publisher.lPush("build-queue", id);
    console.log("id pushed to redis")

    publisher.hSet("status", id, "uploaded");
    res.json({
      id: id,
    });
  } catch (error) {
    res.json({
      id: `some error encountered:${error}`,
    });
  }
});

app.get("/status", async (req, res) => {
  const id = req.query.id;
  try {
    const response = await subscriber.hGet("status", id as string);
    res.json({
      status: response,
    });
  } catch (error) {
    res.json({
      status: error,
    });
  }
});
app.listen(process.env.PORT);
