import { Module } from '@nestjs/common';
import { OverdueCheckService } from './overdue-check.service';
import { MonitoringModule } from '../monitoring/monitoring.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [MonitoringModule, NotificationsModule],
  providers: [OverdueCheckService],
})
export class SchedulerModule {}
