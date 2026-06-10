import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { DoctorService } from './doctor.service';

@ApiTags('Doctors')
@Controller('doctor')
export class DoctorController {
  constructor(private doctorService: DoctorService) {}

  // Doctor Onboarding APIs

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @Post('profile')
  @ApiOperation({ summary: 'Create doctor profile (Authenticated Doctor only)' })
  @ApiResponse({ status: 201, description: 'Doctor profile created successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 409, description: 'Doctor profile already exists.' })
  createProfile(
    @Request() req: { user: { sub: number } },
    @Body() createDoctorDto: CreateDoctorDto,
  ) {
    return this.doctorService.createProfile(req.user.sub, createDoctorDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @Get('profile')
  @ApiOperation({ summary: 'Get current doctor profile (Authenticated Doctor only)' })
  @ApiResponse({ status: 200, description: 'Doctor profile retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Doctor profile not found.' })
  getProfile(@Request() req: { user: { sub: number } }) {
    return this.doctorService.getProfile(req.user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @Patch('profile')
  @ApiOperation({ summary: 'Update doctor profile (Authenticated Doctor only)' })
  @ApiResponse({ status: 200, description: 'Doctor profile updated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Doctor profile not found.' })
  updateProfile(
    @Request() req: { user: { sub: number } },
    @Body() updateDoctorDto: UpdateDoctorDto,
  ) {
    return this.doctorService.updateProfile(req.user.sub, updateDoctorDto);
  }

  // Doctor Discovery APIs

  @Get()
  @ApiOperation({ summary: 'Discover/search doctors with pagination and filters' })
  @ApiQuery({ name: 'search', required: false, description: 'Search doctors by name' })
  @ApiQuery({ name: 'specialization', required: false, description: 'Filter by doctor specialization' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit of items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'List of doctors retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid pagination parameters.' })
  findAll(
    @Query('search') search?: string,
    @Query('specialization')
    specialization?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.doctorService.findAll(
      search,
      specialization,
      Number(page),
      Number(limit),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get doctor details by ID' })
  @ApiResponse({ status: 200, description: 'Doctor details retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid doctor ID (must be integer).' })
  @ApiResponse({ status: 404, description: 'Doctor not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.doctorService.findOne(id);
  }
}
