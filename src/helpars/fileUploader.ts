import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
} from "@aws-sdk/client-s3";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import streamifier from "streamifier"; 
import dotenv from "dotenv";
import { Storage } from "@google-cloud/storage";
import path from "path";
import fs from "fs";

dotenv.config();

// Configure DigitalOcean Spaces
const s3Client = new S3Client({
  region: "us-east-1",
  endpoint: process.env.DO_SPACE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.DO_SPACE_ACCESS_KEY || "",
    secretAccessKey: process.env.DO_SPACE_SECRET_KEY || "",
  },
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer configuration using memoryStorage (for DigitalOcean & Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Fixed Cloudinary Storage
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
  
    public_id: (req, file) => `${Date.now()}_${file.originalname}`,
  },
});

const cloudinaryUpload = multer({ storage: cloudinaryStorage });

// Upload single image
const uploadSingle = upload.single("image");
const uploadFile = upload.single("file");

// Upload multiple images
const uploadMultipleImage = upload.fields([{ name: "images", maxCount: 15 }]);

// Upload profile and banner images
const updateProfile = upload.fields([
  { name: "profile", maxCount: 1 },
  { name: "banner", maxCount: 1 },
]);

// ✅ Fixed Cloudinary Upload (Now supports buffer)
const uploadToCloudinary = async (file: Express.Multer.File): Promise<{ Location: string; public_id: string }> => {
  if (!file) {
    throw new Error("File is required for uploading.");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "uploads",
        resource_type: "auto", // Supports images, videos, etc.
        use_filename: true,
        unique_filename: false,
      },
      (error, result) => {
        if (error) {
          console.error("Error uploading file to Cloudinary:", error);
          return reject(error);
        }

        // ✅ Explicitly return `Location` and `public_id`
        resolve({
          Location: result?.secure_url || "", // Cloudinary URL
          public_id: result?.public_id || "",
        });
      }
    );

    // Convert buffer to stream and upload
    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

// ✅ Unchanged: DigitalOcean Upload
const uploadToDigitalOcean = async (file: Express.Multer.File) => {
  if (!file) {
    throw new Error("File is required for uploading.");
  }

  try {
    const Key = `nathancloud/${Date.now()}_${uuidv4()}_${file.originalname}`;
    const uploadParams = {
      Bucket: process.env.DO_SPACE_BUCKET || "",
      Key,
      Body: file.buffer, // ✅ Use buffer instead of file path
      ACL: "public-read" as ObjectCannedACL,
      ContentType: file.mimetype,
    };

    // Upload file to DigitalOcean Spaces
    await s3Client.send(new PutObjectCommand(uploadParams));

    // Format the URL
    const fileURL = `${process.env.DO_SPACE_ENDPOINT}/${process.env.DO_SPACE_BUCKET}/${Key}`;
    return {
      Location: fileURL,
      Bucket: process.env.DO_SPACE_BUCKET || "",
      Key,
    };
  } catch (error) {
    console.error("Error uploading file to DigitalOcean:", error);
    throw error;
  }
};

// Initialize GCS client with service account credentials from env
const storageGSC = new Storage({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS || "{}"),
});

// GCS Bucket name
const bucketName = process.env.GOOGLE_BUCKET_NAME || "your_default_bucket_name";

// Upload file buffer to GCS and return public URL
export const uploadToGoogleCloud = async (
  file: Express.Multer.File,
  destinationPrefix: string = "uploads"
): Promise<{ Location: string; gcsPath: string }> => {
  if (!file) throw new Error("File is required for Google Cloud upload.");

  const timestampedFileName = `${Date.now()}_${file.originalname}`;
  const destinationPath = `${destinationPrefix}/${timestampedFileName}`;

  const bucket = storageGSC.bucket(bucketName);
  const gcsFile = bucket.file(destinationPath);

  // Upload the file
  await gcsFile.save(file.buffer, {
    resumable: false,
    contentType: file.mimetype,
  });

  // ✅ Ensure public access
  await gcsFile.makePublic();

  return {
    Location: `https://storage.googleapis.com/${bucketName}/${destinationPath}`,
    gcsPath: `gs://${bucketName}/${destinationPath}`,
  };
};

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "..", "..", "uploads");
const checkAndCreateUploadDir = () => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("Upload directory created.");
  }
};

const uploadToLocal = async (file: Express.Multer.File) => {
  if (!file) {
    throw new Error("File is required for uploading.");
  }

  // Ensure the upload directory exists
  checkAndCreateUploadDir();

  // Generate local URL assuming Express serves static `/uploads`
  const fileURL = `${process.env.BACK_END_URL}/uploads/${file.filename}`;
  return {
    Location: fileURL,
    fileName: file.filename,
    mimeType: file.mimetype,
  };
};
// ✅ No Name Changes, Just Fixes
export const fileUploader = {
  upload,
  uploadSingle,
  uploadMultipleImage,
  updateProfile,
  uploadFile,
  cloudinaryUpload,
  uploadToDigitalOcean,
  uploadToCloudinary,
  uploadToGoogleCloud
};
