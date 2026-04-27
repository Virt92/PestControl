import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private service: AuditService) {}

  @Get()
  findAll(@Query('entity') entity?: string, @Query('entityId') entityId?: string) {
    if (entity && entityId) return this.service.findByEntity(entity, entityId);
    return this.service.findAll();
  }
}
