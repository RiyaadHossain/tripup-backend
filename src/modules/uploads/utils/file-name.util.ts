import { extname } from 'path';

export function buildUploadFilename(originalFilename: string) {
  const extension = extname(originalFilename);
  const readableBaseName =
    originalFilename
      .slice(0, extension ? -extension.length : undefined)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'file';

  const uploadFilename = `${readableBaseName}-${Date.now()}`;

  return {
    originalFilename,
    readableBaseName,
    uploadFilename,
  };
}
