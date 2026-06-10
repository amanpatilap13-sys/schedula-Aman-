import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { Patient } from './patient.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Patient]), UsersModule],
  controllers: [PatientController],
  providers: [PatientService],
})
export class PatientModule {}
