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
import { InitialSchema1780918005000 } from './migrations/1780918005000-InitialSchema';

const getDatabaseConfig = () => {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://'))) {
    return {
      type: 'postgres' as const,
      url: dbUrl,
      entities: [User, Doctor, Patient],
      synchronize: true, // Use synchronize for Postgres on hosted DBs since SQLite migrations are dialect-specific
      ssl: {
        rejectUnauthorized: false, // Required for hosted providers like Neon or Supabase
      },
    };
  }

  return {
    type: 'better-sqlite3' as const,
    database: 'db.sqlite',
    entities: [User, Doctor, Patient],
    migrations: [InitialSchema1780918005000],
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
