import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { createReadStream, createWriteStream } from "fs";
import { createGunzip } from "zlib";
const unzipper = require('unzipper');

// Initialize the S3 client
export const s3 = new S3Client({
  region: "us-east-2", // Replace with your S3 bucket region
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY || "", // Replace with your access key
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_KEY || "" // Replace with your secret key
  }
});

const bucketName = "sp-data-silver"; // Replace with your S3 bucket name
const key = "report.html.gz"; // Replace with the key of the file you want to download
const downloadPath = "./"; // Local path to save the downloaded file

export async function downloadFile() {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const gunzip = createGunzip();
    const writeStream = createWriteStream(downloadPath);

    const response = await s3.send(command);
    await response.Body.pipe(gunzip).pipe(writeStream);
    // const readStream = response.Body;

    

    // // @ts-ignore
    // readStream.pipe(gunzip).pipe(writeStream);

    // writeStream.on('finish', () => {
    //   console.log("File downloaded and unzipped successfully");
    // });
    // @ts-ignore
    


    // const gunzip = createGunzip();
    // createReadStream()

    // createReadStream("dl_report.html.gz")
    // .pipe(unzipper.Extract({ path: "./dl_report.html" }))
    // .on('finish', () => {
    //   console.log('File unzipped successfully');
    // })
    // .on('error', (err: any) => {
    //   console.error('Error unzipping file:', err);
    // });
    // const gunzip = createGunzip();
    // const writeStream = createWriteStream(downloadPath);

    // readStream?.pipe(gunzip).pipe(writeStream);

    // writeStream.on('finish', () => {
    //   console.log("File downloaded and unzipped successfully");
    // });
    // console.log("File downloaded successfully");
  } catch (error) {
    console.error("Error downloading file:", error);
  }
}
