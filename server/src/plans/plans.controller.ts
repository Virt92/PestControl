import { Controller, Get, Post, Put, Delete, Param, Body, Query, NotFoundException, UseGuards, Req } from '@nestjs/common';
import { PlansService } from './plans.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditService } from '../audit/audit.service';

@UseGuards(JwtAuthGuard)
@Controller('plans')
export class PlansController {
  constructor(
    private service: PlansService,
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
    await this.audit.log('create', 'plan', e.id, req.user?.id, req.user?.email, `Created plan: ${e.title}`);
    return e;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const e = await this.service.update(id, data);
    if (!e) throw new NotFoundException();
    return e;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.audit.log('delete', 'plan', id, req.user?.id, req.user?.email, 'Deleted plan');
    return this.service.remove(id);
  }
}
