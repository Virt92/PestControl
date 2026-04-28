import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckResult } from './check.entity';
import { MonitoringPoint } from '../monitoring/point.entity';
import { ChecksService } from './checks.service';
import { ChecksController } from './checks.controller';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckResult, MonitoringPoint]),
    AuditModule,
    NotificationsModule,
  ],
  controllers: [ChecksController],
  providers: [ChecksService],
  exports: [ChecksService],
})
export class ChecksModule {}
