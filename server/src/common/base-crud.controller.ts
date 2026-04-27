import { Get, Post, Put, Delete, Param, Body, NotFoundException } from '@nestjs/common';
import { BaseCrudService } from './base-crud.service';

export class BaseCrudController<T extends { id: string }> {
  constructor(protected readonly service: BaseCrudService<T>) {}

  @Get()
  findAll(): Promise<T[]> {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<T> {
    const entity = await this.service.findById(id);
    if (!entity) throw new NotFoundException();
    return entity;
  }

  @Post()
  create(@Body() data: any): Promise<T> {
    return this.service.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any): Promise<T> {
    const entity = await this.service.update(id, data);
    if (!entity) throw new NotFoundException();
    return entity;
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
