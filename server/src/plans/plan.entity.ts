import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('service_plans')
export class ServicePlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  objectId: string;

  @Column()
  clientId: string;

  @Column({ nullable: true })
  companyId: string;

  @Column()
  title: string;

  @Column({ default: 'monthly' })
  frequency: string;

  @Column({ type: 'simple-json', default: '[]' })
  pestTypes: string[];

  @Column({ type: 'simple-json', default: '[]' })
  zones: string[];

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date', nullable: true })
  endDate: string | null;

  @Column({ default: 'active' })
  status: string;

  @Column({ type: 'text', default: '' })
  accessConditions: string;

  @Column({ type: 'simple-json', default: '[]' })
  workTypes: string[];

  @Column({ type: 'text', default: '' })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
