import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteObject } from './object.entity';
import { BaseCrudService } from '../common/base-crud.service';

@Injectable()
export class ObjectsService extends BaseCrudService<SiteObject> {
  constructor(@InjectRepository(SiteObject) repo: Repository<SiteObject>) {
    super(repo);
  }

  findByClient(clientId: string) {
    return this.repo.find({ where: { clientId }, order: { createdAt: 'DESC' } });
  }

  findWithPoints(id: string) {
    return this.repo.findOne({ where: { id }, relations: ['points'] });
  }
}
