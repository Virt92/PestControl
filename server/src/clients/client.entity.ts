import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import { SiteObject } from '../objects/object.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyName: string;

  @Column({ default: '' })
  contactPerson: string;

  @Column({ default: '' })
  phone: string;

  @Column({ default: '' })
  email: string;

  @Column({ default: '' })
  address: string;

  @Column({ default: 'b2b' })
  type: string;

  @Column({ default: 'active' })
  status: string;

  @Column({ type: 'text', default: '' })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => SiteObject, (obj) => obj.client)
  objects: SiteObject[];
}
