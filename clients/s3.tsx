import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
// import JSZip from "jszip";
import AdmZip from 'adm-zip';
const fs = require('fs');
import path from "path";

// Initialize the S3 client
export const s3 = new S3Client({
  region: "us-east-2", // Replace with your S3 bucket region
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY || "", // Replace with your access key
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_KEY || "" // Replace with your secret key
  }
});

export async function downloadFile(bucketName: string, key: string, downloadFilename: string){
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const publicDirectory = path.resolve("./public");
    const downloadPath = path.join(publicDirectory, downloadFilename); // Ensure this path is in your 'public' directory
    
    const response = await s3.send(command);
    // @ts-ignore
    const zip = new AdmZip(response.Body)
    zip.extractAllTo(downloadPath, true);

    
    // await zip.loadAsync(response.Body);
    // const [fileKey] = Object.keys(zip.files);
    // const unzippedFile = zip.files[fileKey];

    // if (unzippedFile) {
    //   const unzippedData = await unzippedFile.async('nodebuffer');
    //   fs.writeFileSync(downloadPath, unzippedData);
    // } else {
    //   console.error('No file found in the zip archive.');
    // }

    
    // await response.Body.pipe(gunzip).pipe(writeStream);
  } catch (error) {
    console.error("Error downloading file from s3:", error);
  }
}
