import { Controller, Get, Post, Put, Delete, Param, Body, Query, NotFoundException, UseGuards, Req } from '@nestjs/common';
import { ChecksService } from './checks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';

@UseGuards(JwtAuthGuard)
@Controller('checks')
export class ChecksController {
  constructor(
    private service: ChecksService,
    private audit: AuditService,
    private notifications: NotificationsService,
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

  @Get('heatmap/:objectId')
  getHeatmap(
    @Param('objectId') objectId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('pestType') pestType?: string,
    @Query('zone') zone?: string,
  ) {
    return this.service.getHeatmapData(objectId, from, to, pestType, zone);
  }

  @Get('consumption/:objectId')
  getConsumption(
    @Param('objectId') objectId: string,
    @Query('months') months?: string,
  ) {
    return this.service.getConsumptionReport(objectId, months ? parseInt(months, 10) : 6);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const e = await this.service.findById(id);
    if (!e) throw new NotFoundException();
    return e;
  }

  @Post()
  async create(@Body() data: any, @Req() req: any) {
    const e = await this.service.createAndUpdatePoint(data);
    await this.audit.log('create', 'check', e.id, req.user?.id, req.user?.email, `Created check for point ${e.pointId}`);

    if (e.activity && (e.activityLevel || 0) >= 3) {
      await this.notifications.createAuto(
        'warning',
        'Висока активність виявлена',
        `Точка ${e.pointId}: рівень активності ${e.activityLevel}`,
        'check', e.id, 'high_activity',
      );
    }

    if (e.equipmentStatus === 'damaged' || e.equipmentStatus === 'missing') {
      await this.notifications.createAuto(
        'critical',
        'Обладнання пошкоджено/відсутнє',
        `Точка ${e.pointId}: стан — ${e.equipmentStatus}`,
        'point', e.pointId, 'equipment_issue',
      );
    }

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
