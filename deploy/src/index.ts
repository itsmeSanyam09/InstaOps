import { createClient } from "redis";
import { copyFinalDist, downloadS3Folder } from "./aws";
import path from "path";
import { buildProject } from "./utils";
import dotenv from "dotenv";
import express from "express";

const app = express();
dotenv.config();
const subscriber = createClient({
  url: `${process.env.redis_url}`,
});
const publisher = createClient({
  url: `${process.env.redis_url}`,
});

subscriber.on("error", (err) => console.error("Redis subscriber error", err));
publisher.on("error", (err) => console.error("Redis publisher error", err));

async function initRedis() {
  try {
    await subscriber.connect();
    await publisher.connect();
    console.log("✅ Redis connected");
  } catch (err) {
    console.error("❌ Redis connection failed:", err);
    process.exit(1);
  }
}
initRedis();

app.get("/admin", (req, res) => {
  try {
    res.status(200).json({ "Deploy Service": "Working" });
  } catch (error) {
    res.status(401).json({ error: `${error}` });
  }
});
async function main() {
  while (1) {
    try {
      const response = await subscriber.brPop("build-queue", 0);
      console.log(response);
      const id: string = response?.element ?? "jbjh";
      await downloadS3Folder(`output/${id}`);
      await buildProject(id);
      await copyFinalDist(id);
      await publisher.hSet("status", id, "deployed");
      console.log("downloaded");
    } catch (error) {
      console.error(error);
    }
  }
}
main();

app.listen(process.env.PORT);
