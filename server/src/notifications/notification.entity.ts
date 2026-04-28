import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'info' })
  type: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: '' })
  relatedEntity: string;

  @Column({ default: '' })
  relatedId: string;

  @Column({ default: false })
  read: boolean;

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;
}
