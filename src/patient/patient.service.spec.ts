import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientService } from './patient.service';
import { Patient } from './patient.entity';
import { UsersService } from '../users/users.service';
import { BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';

describe('PatientService', () => {
  let service: PatientService;
  let patientRepo: Repository<Patient>;
  let usersService: UsersService;

  const mockUser = { id: 1, email: 'patient@example.com', role: 'PATIENT' };
  const mockPatient = {
    id: 1,
    fullName: 'Jane Doe',
    dob: '1998-06-20',
    gender: 'Female',
    contactDetails: '+1234567890',
    healthInfo: 'No allergies',
    user: mockUser,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientService,
        {
          provide: getRepositoryToken(Patient),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PatientService>(PatientService);
    patientRepo = module.get<Repository<Patient>>(getRepositoryToken(Patient));
    usersService = module.get<UsersService>(UsersService);
  });

  describe('createProfile', () => {
    it('should throw ConflictException if profile already exists', async () => {
      jest.spyOn(patientRepo, 'findOne').mockResolvedValue(mockPatient as any);
      await expect(
        service.createProfile(1, {
          fullName: 'Jane Doe',
          dob: '1998-06-20',
          gender: 'Female',
          contactDetails: '+1234567890',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(patientRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(usersService, 'findById').mockResolvedValue(null);
      await expect(
        service.createProfile(1, {
          fullName: 'Jane Doe',
          dob: '1998-06-20',
          gender: 'Female',
          contactDetails: '+1234567890',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if DOB format is invalid', async () => {
      jest.spyOn(patientRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(usersService, 'findById').mockResolvedValue(mockUser as any);
      await expect(
        service.createProfile(1, {
          fullName: 'Jane Doe',
          dob: '20-06-1998', // Invalid format
          gender: 'Female',
          contactDetails: '+1234567890',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if DOB is in the future', async () => {
      jest.spyOn(patientRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(usersService, 'findById').mockResolvedValue(mockUser as any);
      await expect(
        service.createProfile(1, {
          fullName: 'Jane Doe',
          dob: '2050-06-20', // Future DOB
          gender: 'Female',
          contactDetails: '+1234567890',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if DOB does not exist on the calendar', async () => {
      jest.spyOn(patientRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(usersService, 'findById').mockResolvedValue(mockUser as any);
      await expect(
        service.createProfile(1, {
          fullName: 'Jane Doe',
          dob: '2021-02-30', // Invalid day
          gender: 'Female',
          contactDetails: '+1234567890',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should succeed and calculate age correctly', async () => {
      jest.spyOn(patientRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(usersService, 'findById').mockResolvedValue(mockUser as any);
      jest.spyOn(patientRepo, 'create').mockReturnValue(mockPatient as any);
      jest.spyOn(patientRepo, 'save').mockResolvedValue(mockPatient as any);

      // Force current time to fixed date for testing
      jest.useFakeTimers().setSystemTime(new Date('2026-06-12T11:00:00'));

      const result = await service.createProfile(1, {
        fullName: 'Jane Doe',
        dob: '1998-06-20',
        gender: 'Female',
        contactDetails: '+1234567890',
      });

      // Age on 2026-06-12 born on 1998-06-20 should be 27 (since birthday has not occurred yet in June 20)
      expect(result.age).toBe(27);
      expect(result.dob).toBe('1998-06-20');
      jest.useRealTimers();
    });
  });

  describe('updateProfile', () => {
    it('should update DOB and recalculate age correctly', async () => {
      jest.spyOn(patientRepo, 'findOne').mockResolvedValue(mockPatient as any);
      jest.spyOn(patientRepo, 'save').mockImplementation(async (patient) => patient as any);

      jest.useFakeTimers().setSystemTime(new Date('2026-06-12T11:00:00'));

      const result = await service.updateProfile(1, {
        dob: '2000-06-12', // Birthday today!
      });

      expect(result.age).toBe(26);
      expect(result.dob).toBe('2000-06-12');
      jest.useRealTimers();
    });
  });
});
