import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { BaseCrudService } from '../common/base-crud.service';

@Injectable()
export class ClientsService extends BaseCrudService<Client> {
  constructor(@InjectRepository(Client) repo: Repository<Client>) {
    super(repo);
  }

  findWithObjects(id: string) {
    return this.repo.findOne({ where: { id }, relations: ['objects'] });
  }
}
