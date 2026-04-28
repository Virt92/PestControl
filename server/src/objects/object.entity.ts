import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Client } from '../clients/client.entity';
import { MonitoringPoint } from '../monitoring/point.entity';

@Entity('site_objects')
export class SiteObject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clientId: string;

  @ManyToOne(() => Client, (c) => c.objects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @Column()
  name: string;

  @Column({ default: '' })
  address: string;

  @Column({ default: '' })
  type: string;

  @Column({ default: 1 })
  floors: number;

  @Column({ default: '' })
  contactOnSite: string;

  @Column({ default: '' })
  contactPhone: string;

  @Column({ type: 'text', default: '' })
  accessNotes: string;

  @Column({ type: 'text', default: '' })
  floorPlanUrl: string;

  @Column({ default: 'active' })
  status: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ type: 'simple-json', default: '[]' })
  zones: { name: string; floor: string; description: string; }[];

  @Column({ nullable: true })
  assignedMasterId: string;

  @Column({ nullable: true })
  assignedAuditorId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => MonitoringPoint, (p) => p.object)
  points: MonitoringPoint[];
}
