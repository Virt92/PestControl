import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServicePlan } from './plan.entity';
import { BaseCrudService } from '../common/base-crud.service';

@Injectable()
export class PlansService extends BaseCrudService<ServicePlan> {
  constructor(@InjectRepository(ServicePlan) repo: Repository<ServicePlan>) {
    super(repo);
  }

  findByClient(clientId: string) {
    return this.repo.find({ where: { clientId }, order: { createdAt: 'DESC' } });
  }

  findByObject(objectId: string) {
    return this.repo.find({ where: { objectId }, order: { createdAt: 'DESC' } });
  }
}
