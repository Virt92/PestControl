import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { BaseCrudService } from '../common/base-crud.service';

@Injectable()
export class NotificationsService extends BaseCrudService<Notification> {
  constructor(@InjectRepository(Notification) repo: Repository<Notification>) {
    super(repo);
  }

  findUnread(userId?: string) {
    const where: any = { read: false };
    if (userId) where.userId = userId;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async markRead(id: string) {
    await this.repo.update(id, { read: true });
    return this.findById(id);
  }

  async markAllRead(userId?: string) {
    const where: any = { read: false };
    if (userId) where.userId = userId;
    await this.repo.update(where, { read: true });
  }
}
