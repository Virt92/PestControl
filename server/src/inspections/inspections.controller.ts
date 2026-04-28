import { Controller, Get, Post, Put, Delete, Param, Body, Query, NotFoundException, UseGuards, Req } from '@nestjs/common';
import { InspectionsService } from './inspections.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditService } from '../audit/audit.service';

@UseGuards(JwtAuthGuard)
@Controller('inspections')
export class InspectionsController {
  constructor(
    private service: InspectionsService,
    private audit: AuditService,
  ) {}

  @Get()
  findAll(
    @Query('objectId') objectId?: string,
    @Query('clientId') clientId?: string,
  ) {
    if (objectId) return this.service.findByObject(objectId);
    if (clientId) return this.service.findByClient(clientId);
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
    await this.audit.log('create', 'inspection', e.id, req.user?.id, req.user?.email, `Created inspection for object ${e.objectId}`);
    return e;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const e = await this.service.update(id, data);
    if (!e) throw new NotFoundException();
    await this.audit.log('update', 'inspection', id, req.user?.id, req.user?.email, `Updated inspection`);
    return e;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.audit.log('delete', 'inspection', id, req.user?.id, req.user?.email, 'Deleted inspection');
    return this.service.remove(id);
  }
}
