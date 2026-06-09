import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Patient } from './patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,

    private usersService: UsersService,
  ) {}

  async createProfile(
    userId: number,
    createPatientDto: CreatePatientDto,
  ) {
    const existingProfile = await this.patientRepository.findOne({
      where: {
        user: { id: userId },
      },
    });

    if (existingProfile) {
      throw new ConflictException(
        'Patient profile already exists',
      );
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const patient = this.patientRepository.create({
      ...createPatientDto,
      user,
    });

    return await this.patientRepository.save(patient);
  }

  async getProfile(userId: number) {
    const patient = await this.patientRepository.findOne({
      where: {
        user: { id: userId },
      },
      relations: { user: true },
    });

    if (!patient) {
      throw new NotFoundException(
        'Patient profile not found',
      );
    }

    return patient;
  }

  async updateProfile(
    userId: number,
    updatePatientDto: UpdatePatientDto,
  ) {
    const patient = await this.patientRepository.findOne({
      where: {
        user: { id: userId },
      },
      relations: { user: true },
    });

    if (!patient) {
      throw new NotFoundException(
        'Patient profile not found',
      );
    }

    Object.assign(patient, updatePatientDto);

    return await this.patientRepository.save(patient);
  }
}