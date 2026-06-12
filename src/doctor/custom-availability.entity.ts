import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Doctor } from './doctor.entity';

@Entity('custom_availability')
export class CustomAvailability {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: string; // 'YYYY-MM-DD'

  @Column({ type: 'varchar', nullable: true })
  startTime: string | null; // 'HH:MM' (24h) or null

  @Column({ type: 'varchar', nullable: true })
  endTime: string | null; // 'HH:MM' (24h) or null

  @Column({ default: true })
  isAvailable: boolean;

  @ManyToOne(() => Doctor, (doctor) => doctor.customAvailabilities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;
}
