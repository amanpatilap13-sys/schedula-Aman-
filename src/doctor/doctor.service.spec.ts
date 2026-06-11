import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorService } from './doctor.service';
import { Doctor } from './doctor.entity';
import { RecurringAvailability } from './recurring-availability.entity';
import { CustomAvailability } from './custom-availability.entity';
import { UsersService } from '../users/users.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

describe('DoctorService (Availability)', () => {
  let service: DoctorService;
  let doctorRepo: Repository<Doctor>;
  let recurringRepo: Repository<RecurringAvailability>;
  let customRepo: Repository<CustomAvailability>;

  const mockDoctor = {
    id: 1,
    fullName: 'Dr. House',
    specialization: 'Diagnostics',
    experience: 20,
    qualification: 'MD',
    consultationFee: 500,
    availability: '',
    profileDetails: '',
    user: { id: 10 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoctorService,
        {
          provide: getRepositoryToken(Doctor),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RecurringAvailability),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CustomAvailability),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<DoctorService>(DoctorService);
    doctorRepo = module.get<Repository<Doctor>>(getRepositoryToken(Doctor));
    recurringRepo = module.get<Repository<RecurringAvailability>>(
      getRepositoryToken(RecurringAvailability),
    );
    customRepo = module.get<Repository<CustomAvailability>>(
      getRepositoryToken(CustomAvailability),
    );
  });

  describe('validateTimeSlot', () => {
    it('should throw BadRequestException for invalid time formats', async () => {
      jest.spyOn(doctorRepo, 'findOne').mockResolvedValue(mockDoctor as any);
      await expect(
        service.addRecurringAvailability(10, {
          dayOfWeek: 'Monday',
          startTime: '9:00', // invalid format (no leading zero)
          endTime: '11:00',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if startTime >= endTime', async () => {
      jest.spyOn(doctorRepo, 'findOne').mockResolvedValue(mockDoctor as any);
      await expect(
        service.addRecurringAvailability(10, {
          dayOfWeek: 'Monday',
          startTime: '13:00',
          endTime: '12:00',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('addRecurringAvailability', () => {
    it('should check overlaps and throw ConflictException', async () => {
      jest.spyOn(doctorRepo, 'findOne').mockResolvedValue(mockDoctor as any);
      jest.spyOn(recurringRepo, 'find').mockResolvedValue([
        {
          id: 101,
          dayOfWeek: 'Monday',
          startTime: '10:00',
          endTime: '12:00',
          doctor: mockDoctor,
        },
      ] as any);

      // 11:00 - 13:00 overlaps with 10:00 - 12:00
      await expect(
        service.addRecurringAvailability(10, {
          dayOfWeek: 'Monday',
          startTime: '11:00',
          endTime: '13:00',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should succeed if no overlaps exist', async () => {
      jest.spyOn(doctorRepo, 'findOne').mockResolvedValue(mockDoctor as any);
      jest.spyOn(recurringRepo, 'find').mockResolvedValue([
        {
          id: 101,
          dayOfWeek: 'Monday',
          startTime: '10:00',
          endTime: '12:00',
          doctor: mockDoctor,
        },
      ] as any);
      jest.spyOn(recurringRepo, 'create').mockReturnValue({} as any);
      jest.spyOn(recurringRepo, 'save').mockResolvedValue({ id: 102 } as any);

      // 12:00 - 13:00 does not overlap with 10:00 - 12:00
      const result = await service.addRecurringAvailability(10, {
        dayOfWeek: 'Monday',
        startTime: '12:00',
        endTime: '13:00',
      });

      expect(result).toBeDefined();
    });
  });

  describe('getAvailabilityByDate', () => {
    it('should throw NotFoundException if doctor does not exist', async () => {
      jest.spyOn(doctorRepo, 'findOne').mockResolvedValue(null);
      await expect(
        service.getAvailabilityByDate(999, '2026-06-15'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return custom overrides if present', async () => {
      jest.spyOn(doctorRepo, 'findOne').mockResolvedValue(mockDoctor as any);
      jest.spyOn(customRepo, 'find').mockResolvedValue([
        {
          id: 201,
          date: '2026-06-15',
          isAvailable: true,
          startTime: '14:00',
          endTime: '15:00',
          doctor: mockDoctor,
        },
      ] as any);

      const res = await service.getAvailabilityByDate(1, '2026-06-15');
      expect(res.isOverrideApplied).toBe(true);
      expect(res.slots).toHaveLength(1);
      expect(res.slots[0].startTime).toBe('14:00');
    });

    it('should return empty slots if override is unavailable', async () => {
      jest.spyOn(doctorRepo, 'findOne').mockResolvedValue(mockDoctor as any);
      jest.spyOn(customRepo, 'find').mockResolvedValue([
        {
          id: 201,
          date: '2026-06-15',
          isAvailable: false,
          startTime: null,
          endTime: null,
          doctor: mockDoctor,
        },
      ] as any);

      const res = await service.getAvailabilityByDate(1, '2026-06-15');
      expect(res.isOverrideApplied).toBe(true);
      expect(res.slots).toHaveLength(0);
    });

    it('should fall back to recurring availability if no override', async () => {
      jest.spyOn(doctorRepo, 'findOne').mockResolvedValue(mockDoctor as any);
      jest.spyOn(customRepo, 'find').mockResolvedValue([]);
      jest.spyOn(recurringRepo, 'find').mockResolvedValue([
        {
          id: 101,
          dayOfWeek: 'Monday', // 2026-06-15 is Monday
          startTime: '09:00',
          endTime: '12:00',
          doctor: mockDoctor,
        },
      ] as any);

      const res = await service.getAvailabilityByDate(1, '2026-06-15');
      expect(res.isOverrideApplied).toBe(false);
      expect(res.slots).toHaveLength(1);
      expect(res.slots[0].startTime).toBe('09:00');
    });
  });
});
