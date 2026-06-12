import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PatientModule } from './patient/patient.module';
import { DoctorModule } from './doctor/doctor.module';

import { User } from './users/user.entity';
import { Doctor } from './doctor/doctor.entity';
import { Patient } from './patient/patient.entity';
import { RecurringAvailability } from './doctor/recurring-availability.entity';
import { CustomAvailability } from './doctor/custom-availability.entity';
import { Appointment } from './appointment/appointment.entity';
import { AppointmentModule } from './appointment/appointment.module';
import { InitialSchema1780918005000 } from './migrations/1780918005000-InitialSchema';
import { DoctorAvailability1780918006000 } from './migrations/1780918006000-DoctorAvailability';
import { CreateAppointmentSchema1780918007000 } from './migrations/1780918007000-CreateAppointmentSchema';
import { ChangeAgeToDob1780918008000 } from './migrations/1780918008000-ChangeAgeToDob';

const getDatabaseConfig = () => {
  const dbUrl = process.env.DATABASE_URL;
  if (
    dbUrl &&
    (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://'))
  ) {
    return {
      type: 'postgres' as const,
      url: dbUrl,
      entities: [
        User,
        Doctor,
        Patient,
        RecurringAvailability,
        CustomAvailability,
        Appointment,
      ],
      synchronize: true, // Use synchronize for Postgres on hosted DBs since SQLite migrations are dialect-specific
      ssl: {
        rejectUnauthorized: false, // Required for hosted providers like Neon or Supabase
      },
    };
  }

  return {
    type: 'better-sqlite3' as const,
    database: 'db.sqlite',
    entities: [
      User,
      Doctor,
      Patient,
      RecurringAvailability,
      CustomAvailability,
      Appointment,
    ],
    migrations: [
      InitialSchema1780918005000,
      DoctorAvailability1780918006000,
      CreateAppointmentSchema1780918007000,
      ChangeAgeToDob1780918008000,
    ],
    migrationsRun: true,
    synchronize: false,
  };
};

@Module({
  imports: [
    TypeOrmModule.forRoot(getDatabaseConfig()),

    AuthModule,
    UsersModule,
    PatientModule,
    DoctorModule,
    AppointmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
