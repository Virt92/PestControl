import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { SiteObject } from '../objects/object.entity';

@Entity('monitoring_points')
export class MonitoringPoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  objectId: string;

  @ManyToOne(() => SiteObject, (o) => o.points, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'objectId' })
  object: SiteObject;

  @Column()
  number: number;

  @Column({ default: '' })
  tagId: string;

  @Column({ default: 'trap' })
  type: string;

  @Column({ default: '' })
  zone: string;

  @Column({ default: '1' })
  floor: string;

  @Column({ type: 'float', default: 0 })
  positionX: number;

  @Column({ type: 'float', default: 0 })
  positionY: number;

  @Column({ default: 'active' })
  status: string;

  @CreateDateColumn()
  installedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastCheckedAt: Date | null;

  @Column({ type: 'text', default: '' })
  notes: string;
}
