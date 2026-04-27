import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
}
