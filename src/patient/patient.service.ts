import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
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

  private calculateAge(dobString: string): number {
    if (!dobString) return 0;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }

  private validateDob(dobString: string) {
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(dobString)) {
      throw new BadRequestException(
        'Invalid date of birth format. Expected YYYY-MM-DD',
      );
    }
    const parts = dobString.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const dateObj = new Date(Date.UTC(year, month, day));
    if (
      isNaN(dateObj.getTime()) ||
      dateObj.getUTCFullYear() !== year ||
      dateObj.getUTCMonth() !== month ||
      dateObj.getUTCDate() !== day
    ) {
      throw new BadRequestException('Invalid date of birth');
    }

    const today = new Date();
    if (dateObj > today) {
      throw new BadRequestException('Date of birth cannot be in the future');
    }
  }

  private mapPatient(patient: Patient) {
    return {
      id: patient.id,
      fullName: patient.fullName,
      dob: patient.dob,
      gender: patient.gender,
      contactDetails: patient.contactDetails,
      healthInfo: patient.healthInfo,
      user: patient.user,
      age: this.calculateAge(patient.dob),
    };
  }

  async createProfile(userId: number, createPatientDto: CreatePatientDto) {
    const existingProfile = await this.patientRepository.findOne({
      where: {
        user: { id: userId },
      },
    });

    if (existingProfile) {
      throw new ConflictException('Patient profile already exists');
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.validateDob(createPatientDto.dob);

    const patient = this.patientRepository.create({
      ...createPatientDto,
      user,
    });

    const saved = await this.patientRepository.save(patient);
    return this.mapPatient(saved);
  }

  async getProfile(userId: number) {
    const patient = await this.patientRepository.findOne({
      where: {
        user: { id: userId },
      },
      relations: { user: true },
    });

    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    return this.mapPatient(patient);
  }

  async updateProfile(userId: number, updatePatientDto: UpdatePatientDto) {
    const patient = await this.patientRepository.findOne({
      where: {
        user: { id: userId },
      },
      relations: { user: true },
    });

    if (!patient) {
      throw new NotFoundException('Patient profile not found');
    }

    if (updatePatientDto.dob) {
      this.validateDob(updatePatientDto.dob);
    }

    Object.assign(patient, updatePatientDto);

    const saved = await this.patientRepository.save(patient);
    return this.mapPatient(saved);
  }
}
