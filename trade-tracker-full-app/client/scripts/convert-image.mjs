import fs from "fs/promises";

async function convertImageToBase64(imagePath) {
  try {
    const imageBuffer = await fs.readFile(imagePath);
    const base64String = imageBuffer.toString("base64");
    console.log("Base64 string:");
    console.log(base64String);
  } catch (error) {
    console.error("Error converting image:", error);
  }
}

// Usage: node convert-image.mjs <path-to-image>
const imagePath = process.argv[2];
if (!imagePath) {
  console.error("Please provide an image path");
  process.exit(1);
}

convertImageToBase64(imagePath);
