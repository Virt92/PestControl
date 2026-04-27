import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckResult } from './check.entity';
import { BaseCrudService } from '../common/base-crud.service';

@Injectable()
export class ChecksService extends BaseCrudService<CheckResult> {
  constructor(@InjectRepository(CheckResult) repo: Repository<CheckResult>) {
    super(repo);
  }

  findByVisit(visitId: string) {
    return this.repo.find({ where: { visitId }, order: { checkedAt: 'DESC' } });
  }

  findByPoint(pointId: string) {
    return this.repo.find({ where: { pointId }, order: { checkedAt: 'DESC' } });
  }

  findByObject(objectId: string) {
    return this.repo.find({ where: { objectId }, order: { checkedAt: 'DESC' } });
  }
}
