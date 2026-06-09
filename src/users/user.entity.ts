<<<<<<< HEAD
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
} from 'typeorm';

import { Doctor } from '../doctor/doctor.entity';
import { Patient } from '../patient/patient.entity';
=======
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
>>>>>>> c2b0c1e (Implement role based authentication system)

export enum Role {
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'text',
  })
  role: Role;
<<<<<<< HEAD

  @OneToOne(() => Doctor, {
    nullable: true,
  })
  doctorProfile: Doctor;

  @OneToOne(() => Patient, {
    nullable: true,
  })
  patientProfile: Patient;
}
=======
}
>>>>>>> c2b0c1e (Implement role based authentication system)
