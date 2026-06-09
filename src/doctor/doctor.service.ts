import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Doctor } from './doctor.entity';
import { UsersService } from '../users/users.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,

    private usersService: UsersService,
  ) {}

  async createProfile(
    userId: number,
    createDoctorDto: CreateDoctorDto,
  ) {
    const existingProfile =
      await this.doctorRepository.findOne({
        where: {
          user: { id: userId },
        },
        relations: { user: true },
      });

    if (existingProfile) {
      throw new ConflictException(
        'Doctor profile already exists',
      );
    }

    const user =
      await this.usersService.findById(
        userId,
      );

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    const doctor =
      this.doctorRepository.create({
        ...createDoctorDto,
        user,
      });

    return this.doctorRepository.save(
      doctor,
    );
  }

  async getProfile(userId: number) {
    const profile =
      await this.doctorRepository.findOne({
        where: {
          user: { id: userId },
        },
        relations: { user: true },
      });

    if (!profile) {
      throw new NotFoundException(
        'Doctor profile not found',
      );
    }

    return profile;
  }

  async updateProfile(
    userId: number,
    updateDoctorDto: UpdateDoctorDto,
  ) {
    const profile =
      await this.doctorRepository.findOne({
        where: {
          user: { id: userId },
        },
        relations: { user: true },
      });

    if (!profile) {
      throw new NotFoundException(
        'Doctor profile not found',
      );
    }

    Object.assign(profile, updateDoctorDto);

    return this.doctorRepository.save(
      profile,
    );
  }

  async findAll(
    search?: string,
    specialization?: string,
    page = 1,
    limit = 10,
  ) {
    if (page < 1 || limit < 1) {
      throw new BadRequestException(
        'Page and limit must be greater than 0',
      );
    }

    const query =
      this.doctorRepository.createQueryBuilder(
        'doctor',
      );

    if (search) {
      query.andWhere(
        'LOWER(doctor.fullName) LIKE LOWER(:search)',
        {
          search: `%${search}%`,
        },
      );
    }

    if (specialization) {
      query.andWhere(
        'LOWER(doctor.specialization) = LOWER(:specialization)',
        {
          specialization,
        },
      );
    }

    query.skip((page - 1) * limit);
    query.take(limit);

    return query.getMany();
  }

  async findOne(id: number) {
    const doctor =
      await this.doctorRepository.findOne({
        where: { id },
      });

    if (!doctor) {
      throw new NotFoundException(
        'Doctor not found',
      );
    }

    return doctor;
  }
}