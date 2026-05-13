import { BadRequestException } from '@nestjs/common';

export const imageFileFilter = (req: any, file: any, callback: Function) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
    return callback(
      new BadRequestException('Only image files are allowed'),
      false,
    );
  }

  callback(null, true);
};
