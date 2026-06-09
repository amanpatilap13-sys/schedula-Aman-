import {
  Controller,
  Get,
<<<<<<< HEAD
  Post,
  Patch,
  Param,
  Query,
  Body,
=======
>>>>>>> c2b0c1e (Implement role based authentication system)
  Request,
  UseGuards,
} from '@nestjs/common';

<<<<<<< HEAD
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { CreateDoctorDto } from './dto/create-doctor.dto';

=======
>>>>>>> c2b0c1e (Implement role based authentication system)
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

<<<<<<< HEAD
import { DoctorService } from './doctor.service';

@Controller('doctor')
export class DoctorController {
  constructor(private doctorService: DoctorService) {}

  // Doctor Onboarding APIs

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @Post('profile')
  createProfile(
    @Request() req,
    @Body() createDoctorDto: CreateDoctorDto,
  ) {
    return this.doctorService.createProfile(
      req.user.sub,
      createDoctorDto,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @Get('profile')
  getProfile(@Request() req) {
    return this.doctorService.getProfile(
      req.user.sub,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @Patch('profile')
  updateProfile(
    @Request() req,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ) {
    return this.doctorService.updateProfile(
      req.user.sub,
      updateDoctorDto,
    );
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
  findOne(@Param('id') id: string) {
    return this.doctorService.findOne(
      Number(id),
    );
=======
@Controller('doctor')
export class DoctorController {
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('DOCTOR')
  @Get('profile')
  getProfile(@Request() req) {
    return {
      message:
        'Doctor profile accessed',
      user: req.user,
    };
>>>>>>> c2b0c1e (Implement role based authentication system)
  }
}