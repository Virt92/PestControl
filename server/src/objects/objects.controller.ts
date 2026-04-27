import { Controller, Get, Post, Put, Delete, Param, Body, Query, NotFoundException, UseGuards, Req } from '@nestjs/common';
import { ObjectsService } from './objects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditService } from '../audit/audit.service';

@UseGuards(JwtAuthGuard)
@Controller('objects')
export class ObjectsController {
  constructor(
    private service: ObjectsService,
    private audit: AuditService,
  ) {}

  @Get()
  findAll(@Query('clientId') clientId?: string) {
    if (clientId) return this.service.findByClient(clientId);
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const e = await this.service.findWithPoints(id);
    if (!e) throw new NotFoundException();
    return e;
  }

  @Post()
  async create(@Body() data: any, @Req() req: any) {
    const e = await this.service.create(data);
    await this.audit.log('create', 'object', e.id, req.user?.id, req.user?.email, `Created object ${e.name}`);
    return e;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const e = await this.service.update(id, data);
    if (!e) throw new NotFoundException();
    await this.audit.log('update', 'object', id, req.user?.id, req.user?.email, `Updated object ${e.name}`);
    return e;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.audit.log('delete', 'object', id, req.user?.id, req.user?.email, 'Deleted object');
    return this.service.remove(id);
  }
}
