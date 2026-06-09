import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { TypeOrmModule } from '@nestjs/typeorm';

import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { Patient } from './patient.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient]),
    UsersModule,
  ],
  controllers: [PatientController],
  providers: [PatientService],
})
export class PatientModule {}
=======
import { PatientController } from './patient.controller';

@Module({
  controllers: [PatientController]
})
export class PatientModule {}
>>>>>>> c2b0c1e (Implement role based authentication system)
