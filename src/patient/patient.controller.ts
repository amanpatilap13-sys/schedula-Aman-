import {
  Controller,
<<<<<<< HEAD
  Post,
  Get,
  Patch,
  Body,
=======
  Get,
>>>>>>> c2b0c1e (Implement role based authentication system)
  Request,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
<<<<<<< HEAD
import { Role } from '../users/user.entity';

import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Controller('patient')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PATIENT)
export class PatientController {
  constructor(
    private readonly patientService: PatientService,
  ) {}

  @Post('profile')
  createProfile(
    @Request() req,
    @Body() createPatientDto: CreatePatientDto,
  ) {
    return this.patientService.createProfile(
      req.user.sub,
      createPatientDto,
    );
  }

  @Get('profile')
  getProfile(@Request() req) {
    return this.patientService.getProfile(
      req.user.sub,
    );
  }

  @Patch('profile')
  updateProfile(
    @Request() req,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return this.patientService.updateProfile(
      req.user.sub,
      updatePatientDto,
    );
=======

@Controller('patient')
export class PatientController {
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('PATIENT')
  @Get('profile')
  getProfile(@Request() req) {
    return {
      message:
        'Patient profile accessed',
      user: req.user,
    };
>>>>>>> c2b0c1e (Implement role based authentication system)
  }
}