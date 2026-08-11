import { Injectable } from '@nestjs/common';
import { CloudinaryService } from './storage/couldinary.storage';

@Injectable()
export class UploadsService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async uploadImage(file: Express.Multer.File) {
    const result = await this.cloudinaryService.uploadFile(
      file,
      'tripup/images',
    );

    return {
      originalFilename: file.originalname,
      fileName: result.filename,
      fileUrl: result.url,
      publicId: result.publicId,
    };
  }

  async uploadFile(file: Express.Multer.File) {
    const result = await this.cloudinaryService.uploadFile(
      file,
      'tripup/attachments',
    );

    return {
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
      url: result.url,
    };
  }
}
