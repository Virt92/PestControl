import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('inspections')
export class Inspection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  objectId: string;

  @Column()
  clientId: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ default: 'initial' })
  type: string;

  @Column({ default: 'planned' })
  status: string;

  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ default: '' })
  assignedTo: string;

  @Column({ type: 'simple-json', default: '[]' })
  checklist: { question: string; answer: string; }[];

  @Column({ type: 'simple-json', default: '[]' })
  findings: string[];

  @Column({ type: 'simple-json', default: '[]' })
  riskZones: string[];

  @Column({ type: 'simple-json', default: '[]' })
  recommendations: string[];

  @Column({ type: 'simple-json', default: '[]' })
  photos: string[];

  @Column({ type: 'text', default: '' })
  notes: string;

  @Column({ nullable: true })
  actDocumentId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
