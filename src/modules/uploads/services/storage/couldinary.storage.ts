import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { buildUploadFilename } from '../../utils/file-name.util';
import {
  createUploadFormData,
  UploadedLocalFile,
} from '../../utils/file-form.util';

type CloudinaryUploadResult = {
  secure_url?: string;
  public_id?: string;
  resource_type?: string;
  type?: string;
  format?: string;
  original_filename?: string;
};

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(file: UploadedLocalFile, folder: string) {
    console.log({ folder });
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret)
      throw new InternalServerErrorException(
        'Cloudinary is not configured properly',
      );

    const { uploadFilename } = buildUploadFilename(file.filename);
    const { filePath } = await createUploadFormData(
      file,
      uploadFilename,
      apiKey,
      apiSecret,
    );

    const response = await cloudinary.uploader.upload(filePath, {
      folder,
      public_id: uploadFilename,
    });

    console.log(response);
    const result = response as CloudinaryUploadResult;

    if (!result.secure_url) {
      throw new InternalServerErrorException(
        'Cloudinary did not return a public URL',
      );
    }

    return {
      originalFilename: file.filename,
      filename: uploadFilename,
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      deliveryType: result.type,
      format: result.format,
    };
  }
}
