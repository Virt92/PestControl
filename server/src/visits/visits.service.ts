import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visit } from './visit.entity';
import { BaseCrudService } from '../common/base-crud.service';

@Injectable()
export class VisitsService extends BaseCrudService<Visit> {
  constructor(@InjectRepository(Visit) repo: Repository<Visit>) {
    super(repo);
  }

  findByObject(objectId: string) {
    return this.repo.find({ where: { objectId }, order: { scheduledAt: 'DESC' } });
  }

  findByClient(clientId: string) {
    return this.repo.find({ where: { clientId }, order: { scheduledAt: 'DESC' } });
  }
}
