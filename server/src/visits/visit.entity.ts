import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('visits')
export class Visit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  objectId: string;

  @Column()
  clientId: string;

  @Column({ default: '' })
  assignedTo: string;

  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ default: 'inspection' })
  type: string;

  @Column({ default: 'planned' })
  status: string;

  @Column({ type: 'text', default: '' })
  notes: string;

  @Column({ default: 0 })
  pointsChecked: number;

  @Column({ default: 0 })
  pointsTotal: number;

  @CreateDateColumn()
  createdAt: Date;
}
