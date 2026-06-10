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

import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { DoctorService } from './doctor.service';

@Controller('doctor')
export class DoctorController {
  constructor(private doctorService: DoctorService) {}

  // Doctor Onboarding APIs

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @Post('profile')
  createProfile(
    @Request() req: { user: { sub: number } },
    @Body() createDoctorDto: CreateDoctorDto,
  ) {
    return this.doctorService.createProfile(req.user.sub, createDoctorDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @Get('profile')
  getProfile(@Request() req: { user: { sub: number } }) {
    return this.doctorService.getProfile(req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @Patch('profile')
  updateProfile(
    @Request() req: { user: { sub: number } },
    @Body() updateDoctorDto: UpdateDoctorDto,
  ) {
    return this.doctorService.updateProfile(req.user.sub, updateDoctorDto);
  }

  // Doctor Discovery APIs

  @Get()
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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.doctorService.findOne(id);
  }
}
