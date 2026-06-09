import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PatientModule } from './patient/patient.module';
import { DoctorModule } from './doctor/doctor.module';

import { User } from './users/user.entity';
<<<<<<< HEAD
import { Doctor } from './doctor/doctor.entity';
import { Patient } from './patient/patient.entity';
import { InitialSchema1780918005000 } from './migrations/1780918005000-InitialSchema';
=======
>>>>>>> c2b0c1e (Implement role based authentication system)

@Module({
  imports: [
    TypeOrmModule.forRoot({
<<<<<<< HEAD
      type: 'better-sqlite3',
      database: 'db.sqlite',
      entities: [User, Doctor, Patient],
      migrations: [InitialSchema1780918005000],
      migrationsRun: true,
      synchronize: false,
=======
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [User],
      synchronize: true,
>>>>>>> c2b0c1e (Implement role based authentication system)
    }),

    AuthModule,
    UsersModule,
    PatientModule,
    DoctorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}