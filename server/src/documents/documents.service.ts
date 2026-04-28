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

  findPublished(clientId?: string) {
    const where: any = { publishedToClient: true, status: 'published' };
    if (clientId) where.clientId = clientId;
    return this.repo.find({ where, order: { publishedAt: 'DESC' } });
  }

  async publish(id: string) {
    await this.repo.update(id, {
      status: 'published',
      publishedToClient: true,
      publishedAt: new Date(),
    });
    return this.findById(id);
  }

  async unpublish(id: string) {
    await this.repo.update(id, {
      status: 'ready',
      publishedToClient: false,
      publishedAt: null as any,
    });
    return this.findById(id);
  }
}
