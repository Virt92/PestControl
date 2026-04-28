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

  @Column({ default: 'act' })
  type: string;

  @Column()
  title: string;

  @Column({ default: 'draft' })
  status: string;

  @Column({ default: '' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date | null;
}
