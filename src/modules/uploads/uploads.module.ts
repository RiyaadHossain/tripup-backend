import { Module } from '@nestjs/common';
import { UploadsController } from './controllers/uploads.controller';
import { UploadsService } from './services/uploads.service';
import { CloudinaryService } from './services/storage/couldinary.storage';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService, CloudinaryService],
})
export class UploadsModule {}
