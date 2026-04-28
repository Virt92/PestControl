import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class AuditService {
  constructor(@InjectRepository(AuditLog) private repo: Repository<AuditLog>) {}

  async log(action: string, entity: string, entityId: string, userId: string, userName: string, details: string) {
    const entry = this.repo.create({ action, entity, entityId, userId: userId || '', userName: userName || '', details });
    return this.repo.save(entry);
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' }, take: 200 });
  }

  findByEntity(entity: string, entityId: string) {
    return this.repo.find({ where: { entity, entityId }, order: { createdAt: 'DESC' } });
  }
}
