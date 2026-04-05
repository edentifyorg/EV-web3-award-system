import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FilesService } from './files.service';

@ApiTags('Files')
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FilesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async saveFile(@UploadedFile() file: any) {
    return this.fileService.saveFile(file);
  }

  @Get(':id')
  async getFile(@Param('id') id: string, @Res() response: Response) {
    const { fileMeta, fileContent } = await this.fileService.getFile(id);

    response.header('Content-Type', fileMeta.mimeType);
    response.send(fileContent);
  }
}
