import { Controller, Get, Post, Put, Delete, Param, Body, Query, NotFoundException, UseGuards, Req } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditService } from '../audit/audit.service';

@UseGuards(JwtAuthGuard)
@Controller('points')
export class MonitoringController {
  constructor(
    private service: MonitoringService,
    private audit: AuditService,
  ) {}

  @Get()
  findAll(@Query('objectId') objectId?: string) {
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
    await this.audit.log('create', 'point', e.id, req.user?.id, req.user?.email, `Created point #${e.number}`);
    return e;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const e = await this.service.update(id, data);
    if (!e) throw new NotFoundException();
    await this.audit.log('update', 'point', id, req.user?.id, req.user?.email, `Updated point #${e.number}`);
    return e;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.audit.log('delete', 'point', id, req.user?.id, req.user?.email, 'Deleted point');
    return this.service.remove(id);
  }
}
