import { Controller, Get, Post, Put, Delete, Param, Body, Query, NotFoundException, UseGuards, Req } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditService } from '../audit/audit.service';

@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(
    private service: DocumentsService,
    private audit: AuditService,
  ) {}

  @Get()
  findAll(@Query('clientId') clientId?: string, @Query('objectId') objectId?: string) {
    if (clientId) return this.service.findByClient(clientId);
    if (objectId) return this.service.findByObject(objectId);
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const e = await this.service.findById(id);
    if (!e) throw new NotFoundException();
    return e;
  }

  @Post()
  async create(@Body() data: any, @Req() req: any) {
    const e = await this.service.create(data);
    await this.audit.log('create', 'document', e.id, req.user?.id, req.user?.email, `Created document: ${e.title}`);
    return e;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const e = await this.service.update(id, data);
    if (!e) throw new NotFoundException();
    if (data.status === 'published') {
      await this.audit.log('publish', 'document', id, req.user?.id, req.user?.email, `Published document: ${e.title}`);
    }
    return e;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.audit.log('delete', 'document', id, req.user?.id, req.user?.email, 'Deleted document');
    return this.service.remove(id);
  }
}
