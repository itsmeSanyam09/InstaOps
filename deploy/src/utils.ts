import { exec, spawn } from "child_process";
import path, { resolve } from "path";
import fs from "fs";

const projectRoot = process.cwd();
const relativeDir = path.relative(projectRoot, __dirname);

export function buildProject(id: string) {
  return new Promise((resolve) => {
    const child = exec(
      `cd ${path.join(
        __dirname,
        `output/${id}`
      )} && npm install && npx vite build`
    );

    child.stdout?.on("data", function (data) {
      console.log("stdout: " + data);
    });
    child.stderr?.on("data", function (data) {
      console.log("stderr: " + data);
    });
    child.on("close", function (code) {
      resolve("");
    });
  });
}

export const getAllFiles = (folderPath: string) => {
  let response: string[] = [];
  const allFilesAndFolders = fs.readdirSync(folderPath);
  allFilesAndFolders.forEach((file) => {
    const fullFilePath = path.join(folderPath, file);
    if (fs.statSync(fullFilePath).isDirectory()) {
      response = response.concat(getAllFiles(fullFilePath));
    } else {
      const posixPath = fullFilePath.split(path.sep).join("/");
      response.push(posixPath);
    }
  });
  return response;
};
