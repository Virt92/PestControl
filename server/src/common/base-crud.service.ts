import { Repository, DeepPartial, FindOptionsWhere } from 'typeorm';

export class BaseCrudService<T extends { id: string }> {
  constructor(protected readonly repo: Repository<T>) {}

  findAll(): Promise<T[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } as any });
  }

  findById(id: string): Promise<T | null> {
    return this.repo.findOne({ where: { id } as FindOptionsWhere<T> });
  }

  findBy(where: FindOptionsWhere<T>): Promise<T[]> {
    return this.repo.find({ where, order: { createdAt: 'DESC' } as any });
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: DeepPartial<T>): Promise<T | null> {
    await this.repo.update(id, data as any);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
