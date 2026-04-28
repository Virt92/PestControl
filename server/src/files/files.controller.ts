import { Controller, Post, Get, Param, Res, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as fs from 'fs';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('files')
export class FilesController {
  constructor(private service: FilesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async upload(@UploadedFile() file: Express.Multer.File) {
    const url = await this.service.saveFile(file);
    return { url };
  }

  @Get(':filename')
  serve(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = this.service.getFilePath(filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }
    return res.sendFile(filePath);
  }
}
