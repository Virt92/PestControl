import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { MonitoringPoint } from './point.entity';
import { BaseCrudService } from '../common/base-crud.service';

@Injectable()
export class MonitoringService extends BaseCrudService<MonitoringPoint> {
  constructor(@InjectRepository(MonitoringPoint) repo: Repository<MonitoringPoint>) {
    super(repo);
  }

  findByObject(objectId: string) {
    return this.repo.find({ where: { objectId }, order: { number: 'ASC' } });
  }

  findOverdue() {
    return this.repo.find({
      where: {
        status: 'active',
        nextCheckDue: LessThan(new Date()),
      },
      order: { nextCheckDue: 'ASC' },
    });
  }

  async bindQr(id: string, tagId: string) {
    const point = await this.findById(id);
    if (!point) return null;
    point.tagId = tagId;
    point.qrStatus = 'bound';
    return this.repo.save(point);
  }

  async deactivateQr(id: string) {
    const point = await this.findById(id);
    if (!point) return null;
    point.qrStatus = 'deactivated';
    point.status = 'inactive';
    return this.repo.save(point);
  }
}
