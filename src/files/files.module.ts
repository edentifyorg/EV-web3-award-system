import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FileController } from './files.controller';
import { FilesService } from './files.service';
import { FilesStorage } from './files.storage';
import { FilesRepository } from './files.repository';
import { FilesHelper } from './files.helper';

@Module({
  controllers: [FileController],
  imports: [PrismaModule],
  providers: [FilesService, FilesStorage, FilesRepository, FilesHelper],
  exports: [FilesService, FilesRepository],
})
export class FilesModule {}
