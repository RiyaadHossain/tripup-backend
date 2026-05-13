import { createHash } from 'crypto';
import { readFile } from 'fs/promises';
import { join } from 'path';

export type UploadedLocalFile = {
  filename: string;
  mimetype?: string;
  path?: string;
};

export async function createUploadFormData(
  file: UploadedLocalFile,
  uploadFilename: string,
  apiKey: string,
  apiSecret: string,
) {
  const timestamp = Math.floor(Date.now() / 1000);
  const deliveryType = 'upload';
  const signature = createHash('sha1')
    .update(`timestamp=${timestamp}&type=${deliveryType}${apiSecret}`)
    .digest('hex');
  const filePath = file.path ?? join(process.cwd(), 'uploads', file.filename);
  const buffer = await readFile(filePath);
  const formData = new FormData();

  formData.append(
    'file',
    new Blob([buffer], {
      type: file.mimetype ?? 'application/octet-stream',
    }),
    uploadFilename,
  );
  formData.append('api_key', apiKey);
  formData.append('type', deliveryType);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);

  return {
    filePath,
    formData,
  };
}
