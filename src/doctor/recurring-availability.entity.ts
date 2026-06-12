import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Doctor } from './doctor.entity';

@Entity('recurring_availability')
export class RecurringAvailability {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dayOfWeek: string; // 'Monday', 'Tuesday', ...

  @Column()
  startTime: string; // 'HH:MM' (24h)

  @Column()
  endTime: string; // 'HH:MM' (24h)

  @ManyToOne(() => Doctor, (doctor) => doctor.recurringAvailabilities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;
}
