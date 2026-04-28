import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('check_results')
export class CheckResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  visitId: string;

  @Column()
  pointId: string;

  @Column()
  objectId: string;

  @Column({ default: false })
  activity: boolean;

  @Column({ default: 0 })
  activityLevel: number;

  @Column({ type: 'float', nullable: true })
  consumptionPercent: number | null;

  @Column({ type: 'float', nullable: true })
  consumptionGrams: number | null;

  @Column({ default: '' })
  pestType: string;

  @Column({ type: 'simple-json', default: '[]' })
  photos: string[];

  @Column({ type: 'text', default: '' })
  correctiveAction: string;

  @Column({ default: 'ok' })
  equipmentStatus: string;

  @Column({ type: 'text', default: '' })
  notes: string;

  @CreateDateColumn()
  checkedAt: Date;

  @Column({ default: '' })
  checkedBy: string;
}
