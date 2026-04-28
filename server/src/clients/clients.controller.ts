import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException, UseGuards, Req } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditService } from '../audit/audit.service';

@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(
    private service: ClientsService,
    private audit: AuditService,
  ) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const e = await this.service.findWithObjects(id);
    if (!e) throw new NotFoundException();
    return e;
  }

  @Post()
  async create(@Body() data: any, @Req() req: any) {
    const e = await this.service.create(data);
    await this.audit.log('create', 'client', e.id, req.user?.id, req.user?.email, `Created client ${e.companyName}`);
    return e;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const e = await this.service.update(id, data);
    if (!e) throw new NotFoundException();
    await this.audit.log('update', 'client', id, req.user?.id, req.user?.email, `Updated client ${e.companyName}`);
    return e;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.audit.log('delete', 'client', id, req.user?.id, req.user?.email, `Deleted client`);
    return this.service.remove(id);
  }
}
