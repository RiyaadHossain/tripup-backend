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
}
