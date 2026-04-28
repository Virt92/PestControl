import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inspection } from './inspection.entity';
import { BaseCrudService } from '../common/base-crud.service';

@Injectable()
export class InspectionsService extends BaseCrudService<Inspection> {
  constructor(@InjectRepository(Inspection) repo: Repository<Inspection>) {
    super(repo);
  }

  findByObject(objectId: string) {
    return this.repo.find({ where: { objectId }, order: { createdAt: 'DESC' } });
  }

  findByClient(clientId: string) {
    return this.repo.find({ where: { clientId }, order: { createdAt: 'DESC' } });
  }
}
