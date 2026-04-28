import { Controller, Get, Post, Put, Delete, Param, Body, Query, NotFoundException, UseGuards, Req } from '@nestjs/common';
import { ChecksService } from './checks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditService } from '../audit/audit.service';

@UseGuards(JwtAuthGuard)
@Controller('checks')
export class ChecksController {
  constructor(
    private service: ChecksService,
    private audit: AuditService,
  ) {}

  @Get()
  findAll(
    @Query('visitId') visitId?: string,
    @Query('pointId') pointId?: string,
    @Query('objectId') objectId?: string,
  ) {
    if (visitId) return this.service.findByVisit(visitId);
    if (pointId) return this.service.findByPoint(pointId);
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
    await this.audit.log('create', 'check', e.id, req.user?.id, req.user?.email, `Created check for point ${e.pointId}`);
    return e;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const e = await this.service.update(id, data);
    if (!e) throw new NotFoundException();
    return e;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
