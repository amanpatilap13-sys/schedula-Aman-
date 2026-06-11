import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { User } from '../users/user.entity';
import { RecurringAvailability } from './recurring-availability.entity';
import { CustomAvailability } from './custom-availability.entity';

@Entity()
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column()
  specialization: string;

  @Column()
  experience: number;

  @Column()
  qualification: string;

  @Column('float')
  consultationFee: number;

  @Column({ nullable: true })
  availability: string;

  @Column({ nullable: true })
  profileDetails: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @OneToMany(() => RecurringAvailability, (ra) => ra.doctor)
  recurringAvailabilities: RecurringAvailability[];

  @OneToMany(() => CustomAvailability, (ca) => ca.doctor)
  customAvailabilities: CustomAvailability[];
}

