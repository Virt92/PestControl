import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string;

  @Column()
  entity: string;

  @Column()
  entityId: string;

  @Column({ default: '' })
  userId: string;

  @Column({ default: '' })
  userName: string;

  @Column({ type: 'text', default: '' })
  details: string;

  @CreateDateColumn()
  createdAt: Date;
}
