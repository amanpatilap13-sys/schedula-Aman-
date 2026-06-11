import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Request,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { CreateRecurringAvailabilityDto, UpdateRecurringAvailabilityDto } from './dto/recurring-availability.dto';
import { CreateCustomOverrideDto } from './dto/custom-override.dto';
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

  // --- Doctor Availability Management APIs ---

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @Post('availability')
  @ApiOperation({ summary: 'Set a new weekly recurring availability slot' })
  @ApiResponse({ status: 201, description: 'Recurring availability slot created.' })
  @ApiResponse({ status: 400, description: 'Invalid time slot / range.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 409, description: 'Overlapping slot/conflict.' })
  addRecurringAvailability(
    @Request() req: { user: { sub: number } },
    @Body() dto: CreateRecurringAvailabilityDto,
  ) {
    return this.doctorService.addRecurringAvailability(req.user.sub, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @Get('availability')
  @ApiOperation({ summary: 'Get all recurring availability slots for the logged-in doctor' })
  @ApiResponse({ status: 200, description: 'List of recurring slots.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getRecurringAvailability(@Request() req: { user: { sub: number } }) {
    return this.doctorService.getRecurringAvailability(req.user.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @Patch('availability/:id')
  @ApiOperation({ summary: 'Update a specific recurring availability slot' })
  @ApiResponse({ status: 200, description: 'Recurring availability slot updated.' })
  @ApiResponse({ status: 400, description: 'Invalid time slot / range.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Slot not found.' })
  @ApiResponse({ status: 409, description: 'Overlapping slot/conflict.' })
  updateRecurringAvailability(
    @Request() req: { user: { sub: number } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRecurringAvailabilityDto,
  ) {
    return this.doctorService.updateRecurringAvailability(req.user.sub, id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @Delete('availability/:id')
  @ApiOperation({ summary: 'Delete a specific recurring availability slot' })
  @ApiResponse({ status: 200, description: 'Slot deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Slot not found.' })
  deleteRecurringAvailability(
    @Request() req: { user: { sub: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.doctorService.deleteRecurringAvailability(req.user.sub, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @Post('availability/override')
  @ApiOperation({ summary: 'Set custom availability slots override for a specific date' })
  @ApiResponse({ status: 201, description: 'Custom availability override saved.' })
  @ApiResponse({ status: 400, description: 'Invalid date/time/slots.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  setCustomOverride(
    @Request() req: { user: { sub: number } },
    @Body() dto: CreateCustomOverrideDto,
  ) {
    return this.doctorService.setCustomOverride(req.user.sub, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @Delete('availability/override')
  @ApiOperation({ summary: 'Delete custom override for a specific date' })
  @ApiQuery({ name: 'date', example: '2026-06-15', description: 'Date in YYYY-MM-DD format to clear the override' })
  @ApiResponse({ status: 200, description: 'Custom override deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Override not found.' })
  deleteCustomOverride(
    @Request() req: { user: { sub: number } },
    @Query('date') date: string,
  ) {
    return this.doctorService.deleteCustomOverride(req.user.sub, date);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('availability/date')
  @ApiOperation({ summary: 'Get doctor availability for a specific date (overrides vs recurring fallback)' })
  @ApiQuery({ name: 'date', example: '2026-06-15', description: 'Date in YYYY-MM-DD format' })
  @ApiQuery({ name: 'doctorId', required: false, description: 'Doctor ID (optional if logged in as DOCTOR)' })
  @ApiResponse({ status: 200, description: 'Doctor availability slots for the target date.' })
  @ApiResponse({ status: 400, description: 'Invalid date or missing parameters.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getAvailabilityByDate(
    @Request() req: { user: { sub: number; role: string } },
    @Query('date') date: string,
    @Query('doctorId') doctorIdStr?: string,
  ) {
    let doctorId: number;
    if (doctorIdStr) {
      doctorId = parseInt(doctorIdStr, 10);
      if (isNaN(doctorId)) {
        throw new BadRequestException('Invalid doctorId');
      }
    } else {
      if (req.user && req.user.role === 'DOCTOR') {
        const doctor = await this.doctorService.getProfile(req.user.sub);
        doctorId = doctor.id;
      } else {
        throw new BadRequestException('doctorId is required for non-doctor users');
      }
    }
    return this.doctorService.getAvailabilityByDate(doctorId, date);
  }
}
