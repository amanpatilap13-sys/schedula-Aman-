import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../users/user.entity';

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

  @Column()
  availability: string;

  @Column({ nullable: true })
  profileDetails: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
