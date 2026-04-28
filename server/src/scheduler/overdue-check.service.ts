import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { MonitoringService } from '../monitoring/monitoring.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OverdueCheckService implements OnModuleInit {
  private readonly logger = new Logger(OverdueCheckService.name);
  private interval: NodeJS.Timeout;

  constructor(
    private monitoring: MonitoringService,
    private notifications: NotificationsService,
  ) {}

  onModuleInit() {
    this.interval = setInterval(() => this.checkOverdue(), 60 * 60 * 1000);
    setTimeout(() => this.checkOverdue(), 10000);
  }

  async checkOverdue() {
    try {
      const overdue = await this.monitoring.findOverdue();
      this.logger.log(`Found ${overdue.length} overdue points`);

      for (const point of overdue) {
        const hoursOverdue = point.nextCheckDue
          ? Math.floor((Date.now() - new Date(point.nextCheckDue).getTime()) / 3600000)
          : 0;

        if (hoursOverdue > 0) {
          await this.notifications.createAuto(
            'warning',
            'Прострочена перевірка',
            `Точка #${point.number} (${point.zone || 'без зони'}): прострочено ${hoursOverdue} год.`,
            'point',
            point.id,
            'overdue_check',
          );
        }
      }
    } catch (err) {
      this.logger.error('Overdue check failed', err);
    }
  }
}
