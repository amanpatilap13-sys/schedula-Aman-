import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { TypeOrmModule } from '@nestjs/typeorm';

import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { Doctor } from './doctor.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Doctor]),
    UsersModule,
  ],
  controllers: [DoctorController],
  providers: [DoctorService],
})
export class DoctorModule {}
=======
import { DoctorController } from './doctor.controller';

@Module({
  controllers: [DoctorController]
})
export class DoctorModule {}
>>>>>>> c2b0c1e (Implement role based authentication system)
