import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  objectId: string;

  @Column()
  clientId: string;

  @Column({ nullable: true })
  visitId: string;

  @Column({ nullable: true })
  inspectionId: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ default: 'act' })
  type: string;

  @Column()
  title: string;

  @Column({ default: 'draft' })
  status: string;

  @Column({ default: '' })
  createdBy: string;

  @Column({ default: false })
  publishedToClient: boolean;

  @Column({ nullable: true })
  templateId: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ nullable: true })
  fileUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date | null;
}
