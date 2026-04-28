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

  @Column({ nullable: true })
  companyId: string;

  @Column({ type: 'simple-json', default: '[]' })
  contacts: { name: string; role: string; phone: string; email: string; comment: string; }[];

  @Column({ default: '' })
  edrpou: string;

  @Column({ default: '' })
  inn: string;

  @Column({ default: '' })
  legalAddress: string;

  @Column({ default: '' })
  bankDetails: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => SiteObject, (obj) => obj.client)
  objects: SiteObject[];
}
