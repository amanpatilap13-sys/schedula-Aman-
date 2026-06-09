import { DataSource } from 'typeorm';
import { User } from './users/user.entity';
import { Doctor } from './doctor/doctor.entity';
import { Patient } from './patient/patient.entity';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: 'db.sqlite',
  entities: [User, Doctor, Patient],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
