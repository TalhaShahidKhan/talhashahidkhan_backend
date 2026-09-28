import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  uploadFile(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload failed: no result returned'));
          resolve(result);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteFileFromUrl(url: string): Promise<void> {
    try {
      const parts = url.split('/upload/');
      if (parts.length !== 2) return;
      
      let publicIdWithExtension = parts[1];
      if (publicIdWithExtension.match(/^v\d+\//)) {
        publicIdWithExtension = publicIdWithExtension.replace(/^v\d+\//, '');
      }
      const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');
      
      await new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        });
      });
    } catch (error) {
      console.error(`Failed to delete Cloudinary asset for URL ${url}:`, error);
    }
  }
}
