import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';

import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@ApiTags('Patients')
@ApiBearerAuth()
@Controller('patient')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PATIENT)
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post('profile')
  @ApiOperation({ summary: 'Create patient profile (Authenticated Patient only)' })
  @ApiResponse({ status: 201, description: 'Patient profile created successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 409, description: 'Patient profile already exists.' })
  createProfile(
    @Request() req: { user: { sub: number } },
    @Body() createPatientDto: CreatePatientDto,
  ) {
    return this.patientService.createProfile(req.user.sub, createPatientDto);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current patient profile (Authenticated Patient only)' })
  @ApiResponse({ status: 200, description: 'Patient profile retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Patient profile not found.' })
  getProfile(@Request() req: { user: { sub: number } }) {
    return this.patientService.getProfile(req.user.sub);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update patient profile (Authenticated Patient only)' })
  @ApiResponse({ status: 200, description: 'Patient profile updated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Patient profile not found.' })
  updateProfile(
    @Request() req: { user: { sub: number } },
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return this.patientService.updateProfile(req.user.sub, updatePatientDto);
  }
}
