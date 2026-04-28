import { Controller, Get, Post, Put, Delete, Param, Body, Query, NotFoundException, UseGuards, Req } from '@nestjs/common';
import { VisitsService } from './visits.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';

@UseGuards(JwtAuthGuard)
@Controller('visits')
export class VisitsController {
  constructor(
    private service: VisitsService,
    private audit: AuditService,
    private notifications: NotificationsService,
  ) {}

  @Get()
  findAll(@Query('objectId') objectId?: string, @Query('clientId') clientId?: string) {
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
    await this.audit.log('create', 'visit', e.id, req.user?.id, req.user?.email, `Created visit`);

    if (e.assignedTo) {
      await this.notifications.createAuto(
        'task',
        'Виїзд призначено',
        `Вам призначено виїзд на ${new Date(e.scheduledAt).toLocaleDateString('uk-UA')}`,
        'visit', e.id, 'visit_assigned',
        e.assignedTo,
      );
    }

    return e;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const e = await this.service.update(id, data);
    if (!e) throw new NotFoundException();
    await this.audit.log('update', 'visit', id, req.user?.id, req.user?.email, `Updated visit status: ${e.status}`);

    if (data.status === 'completed') {
      await this.notifications.createAuto(
        'info',
        'Виїзд завершено',
        `Виїзд #${id.slice(0, 8)} завершено`,
        'visit', id, 'visit_completed',
      );
    }

    return e;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.audit.log('delete', 'visit', id, req.user?.id, req.user?.email, 'Deleted visit');
    return this.service.remove(id);
  }
}
