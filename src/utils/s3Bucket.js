// import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
// import fs from 'fs';
// import path from 'path';

// class S3Service {
//   // Upload to S3 method
//   async uploadToS3(file, folder, s3details) {
//     let fileStream;
//     try {
//       if (!s3details.s3key || !s3details.s3secret || !s3details.s3bucket_name) {
//         throw new Error('Invalid S3 details provided.');
//       }

//       const s3Client = new S3Client({
//         region: s3details.s3region,
//         credentials: {
//           accessKeyId: s3details.s3key,
//           secretAccessKey: s3details.s3secret,
//         },
//       });

//       const Bucket = s3details.s3bucket_name;
//       const fileExtension = path.extname(file.originalname);
//       const fileName = `keerthijewellery/webadmin/assets/${folder}/${Date.now()}${fileExtension}`;

//       if (!fs.existsSync(file.path)) {
//         throw new Error(`File not found at path: ${file.path}`);
//       }

//       fileStream = fs.createReadStream(file.path);

//       const uploadParams = {
//         Bucket,
//         Key: fileName,
//         Body: fileStream,
//         ContentType: file.mimetype,
//       };

//       await s3Client.send(new PutObjectCommand(uploadParams));

//       const uploadedFileUrl = `${s3details.s3display_url}${fileName}`;
//       console.info('File uploaded successfully:', fileName);
//       console.info('Uploaded File URL:', uploadedFileUrl);

//       console.info('File uploaded successfully:', fileName);
//       return path.basename(fileName);
//     } catch (error) {
//       console.error('S3 upload error:', error);
//       if (fileStream) fileStream.destroy();
//       fs.unlink(file.path, (err) => {
//         if (err) console.error('Error deleting temp file:', err);
//       });
//       throw error;
//     } finally {
//       if (fileStream) fileStream.destroy();
//       fs.unlink(file.path, (err) => {
//         if (err) console.error('Error deleting temp file:', err);
//       });
//     }
//   }

//   // Delete from S3 method
//   async deleteFromS3(fileKey, s3configs) {
//     try {
//       console.info('Starting S3 delete for file:', fileKey);

//       const deleteParams = {
//         Bucket: s3configs.s3bucket_name,
//         Key: fileKey,
//       };

//       const s3Client = new S3Client({ region: s3configs.s3region });

//       await s3Client.send(new DeleteObjectCommand(deleteParams));

//       console.info('S3 delete successful');
//       return true;
//     } catch (error) {
//       console.error('S3 delete error:', error);
//       throw error;
//     }
//   }
// }

// export default S3Service;

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';

class S3Service {
  async uploadToS3(file, folder, s3details) {
    try {
      if (!s3details.s3key || !s3details.s3secret || !s3details.s3bucket_name) {
        throw new Error('Invalid S3 details provided.');
      }

      const s3Client = new S3Client({
        region: s3details.s3region,
        credentials: {
          accessKeyId: s3details.s3key,
          secretAccessKey: s3details.s3secret,
        },
      });
      const Bucket = s3details.s3bucket_name;
      const fileExtension = path.extname(file.originalname);
      const fileName = `keerthijewellery/webadmin/assets/${folder}/${Date.now()}${fileExtension}`;

      if (!file.buffer) {
        throw new Error('File buffer is empty or invalid.');
      }

      const uploadParams = {
        Bucket,
        Key: fileName,
        Body: file.buffer, 
        ContentType: file.mimetype,
        ACL: 'public-read',
      };

      await s3Client.send(new PutObjectCommand(uploadParams));

      const uploadedFileUrl = `${s3details.s3display_url}${fileName}`;
      console.info('File uploaded successfully:', fileName);
      console.info('Uploaded File URL:', uploadedFileUrl);

      return path.basename(fileName);
    } catch (error) {
      console.error('S3 upload error:', error);
      throw error;
    }
  }

  // Delete from S3 method
  async deleteFromS3(fileKey, s3configs) {
    try {
      console.info('Starting S3 delete for file:', fileKey);

      const deleteParams = {
        Bucket: s3configs.s3bucket_name,
        Key: fileKey,
      };

      const s3Client = new S3Client({ region: s3configs.s3region });

      await s3Client.send(new DeleteObjectCommand(deleteParams));

      console.info('S3 delete successful');
      return true;
    } catch (error) {
      console.error('S3 delete error:', error);
      throw error;
    }
  }
}

export default S3Service;
