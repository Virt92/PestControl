import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './document.entity';
import { BaseCrudService } from '../common/base-crud.service';

@Injectable()
export class DocumentsService extends BaseCrudService<Document> {
  constructor(@InjectRepository(Document) repo: Repository<Document>) {
    super(repo);
  }

  findByClient(clientId: string) {
    return this.repo.find({ where: { clientId }, order: { createdAt: 'DESC' } });
  }

  findByObject(objectId: string) {
    return this.repo.find({ where: { objectId }, order: { createdAt: 'DESC' } });
  }

  findPublished(clientId: string) {
    return this.repo.find({ where: { clientId, status: 'published' }, order: { createdAt: 'DESC' } });
  }
}
