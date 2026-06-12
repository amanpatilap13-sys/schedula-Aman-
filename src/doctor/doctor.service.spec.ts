import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorService } from './doctor.service';
import { Doctor } from './doctor.entity';
import { RecurringAvailability } from './recurring-availability.entity';
import { CustomAvailability } from './custom-availability.entity';
import { Appointment } from '../appointment/appointment.entity';
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
  let appointmentRepo: Repository<Appointment>;

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
          provide: getRepositoryToken(Appointment),
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
  appointmentRepo = module.get<Repository<Appointment>>(
    getRepositoryToken(Appointment),
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

  describe('generateSlotsForDoctor', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it('should throw NotFoundException if doctor does not exist', async () => {
      jest.spyOn(doctorRepo, 'findOne').mockResolvedValue(null);
      await expect(
        service.generateSlotsForDoctor(999, '2026-06-20', '15'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid date format', async () => {
      jest.spyOn(doctorRepo, 'findOne').mockResolvedValue(mockDoctor as any);
      await expect(
        service.generateSlotsForDoctor(1, '20-06-2026', '15'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if date is in the past', async () => {
      jest.spyOn(doctorRepo, 'findOne').mockResolvedValue(mockDoctor as any);
      jest.useFakeTimers().setSystemTime(new Date('2026-06-12T11:00:00'));

      await expect(
        service.generateSlotsForDoctor(1, '2026-06-11', '15'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if duration is invalid', async () => {
      jest.spyOn(doctorRepo, 'findOne').mockResolvedValue(mockDoctor as any);
      jest.useFakeTimers().setSystemTime(new Date('2026-06-12T11:00:00'));

      await expect(
        service.generateSlotsForDoctor(1, '2026-06-20', 'abc'),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.generateSlotsForDoctor(1, '2026-06-20', '-10'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if there is no availability defined', async () => {
      jest.spyOn(doctorRepo, 'findOne').mockResolvedValue(mockDoctor as any);
      jest.useFakeTimers().setSystemTime(new Date('2026-06-12T11:00:00'));
      jest.spyOn(customRepo, 'find').mockResolvedValue([]);
      jest.spyOn(recurringRepo, 'find').mockResolvedValue([]);

      await expect(
        service.generateSlotsForDoctor(1, '2026-06-20', '15'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should generate slots correctly based on recurring availability', async () => {
      jest.spyOn(doctorRepo, 'findOne').mockResolvedValue(mockDoctor as any);
      jest.useFakeTimers().setSystemTime(new Date('2026-06-12T11:00:00'));
      jest.spyOn(customRepo, 'find').mockResolvedValue([]);
      jest.spyOn(recurringRepo, 'find').mockResolvedValue([
        {
          id: 101,
          dayOfWeek: 'Saturday', // 2026-06-20 is Saturday
          startTime: '10:00',
          endTime: '11:00',
          doctor: mockDoctor,
        },
      ] as any);
      jest.spyOn(appointmentRepo, 'find').mockResolvedValue([]);

      const slots = await service.generateSlotsForDoctor(1, '2026-06-20', '15');
      expect(slots).toHaveLength(4);
      expect(slots[0]).toEqual({ startTime: '10:00', endTime: '10:15' });
      expect(slots[3]).toEqual({ startTime: '10:45', endTime: '11:00' });
    });

    it('should generate slots correctly based on custom override availability', async () => {
      jest.spyOn(doctorRepo, 'findOne').mockResolvedValue(mockDoctor as any);
      jest.useFakeTimers().setSystemTime(new Date('2026-06-12T11:00:00'));
      jest.spyOn(customRepo, 'find').mockResolvedValue([
        {
          id: 201,
          date: '2026-06-20',
          isAvailable: true,
          startTime: '14:00',
          endTime: '15:00',
          doctor: mockDoctor,
        },
      ] as any);
      jest.spyOn(appointmentRepo, 'find').mockResolvedValue([]);

      // Overrides override recurring availability
      const slots = await service.generateSlotsForDoctor(1, '2026-06-20', '30');
      expect(slots).toHaveLength(2);
      expect(slots[0]).toEqual({ startTime: '14:00', endTime: '14:30' });
      expect(slots[1]).toEqual({ startTime: '14:30', endTime: '15:00' });
    });

    it('should filter out booked slots', async () => {
      jest.spyOn(doctorRepo, 'findOne').mockResolvedValue(mockDoctor as any);
      jest.useFakeTimers().setSystemTime(new Date('2026-06-12T11:00:00'));
      jest.spyOn(customRepo, 'find').mockResolvedValue([]);
      jest.spyOn(recurringRepo, 'find').mockResolvedValue([
        {
          id: 101,
          dayOfWeek: 'Saturday',
          startTime: '10:00',
          endTime: '11:00',
          doctor: mockDoctor,
        },
      ] as any);

      // Booked appointment from 10:15 to 10:30
      jest.spyOn(appointmentRepo, 'find').mockResolvedValue([
        {
          id: 1,
          date: '2026-06-20',
          startTime: '10:15',
          endTime: '10:30',
          status: 'booked',
        },
      ] as any);

      const slots = await service.generateSlotsForDoctor(1, '2026-06-20', '15');
      // Should have 3 slots instead of 4 (10:15 - 10:30 is missing)
      expect(slots).toHaveLength(3);
      expect(slots.map(s => s.startTime)).not.toContain('10:15');
      expect(slots.map(s => s.startTime)).toContain('10:00');
      expect(slots.map(s => s.startTime)).toContain('10:30');
      expect(slots.map(s => s.startTime)).toContain('10:45');
    });

    it('should filter out past slots if date is today', async () => {
      jest.spyOn(doctorRepo, 'findOne').mockResolvedValue(mockDoctor as any);
      // Mock system time to 2026-06-12 10:20:00
      jest.useFakeTimers().setSystemTime(new Date('2026-06-12T10:20:00'));
      jest.spyOn(customRepo, 'find').mockResolvedValue([]);
      jest.spyOn(recurringRepo, 'find').mockResolvedValue([
        {
          id: 101,
          dayOfWeek: 'Friday', // 2026-06-12 is Friday
          startTime: '10:00',
          endTime: '11:00',
          doctor: mockDoctor,
        },
      ] as any);
      jest.spyOn(appointmentRepo, 'find').mockResolvedValue([]);

      const slots = await service.generateSlotsForDoctor(1, '2026-06-12', '15');
      // 10:00 - 10:15 is in past (starts before 10:20)
      // 10:15 - 10:30 is in past (starts before 10:20)
      // 10:30 - 10:45 is in future
      // 10:45 - 11:00 is in future
      expect(slots).toHaveLength(2);
      expect(slots[0].startTime).toBe('10:30');
      expect(slots[1].startTime).toBe('10:45');
    });

    it('should throw NotFoundException if no slots are left after filtering', async () => {
      jest.spyOn(doctorRepo, 'findOne').mockResolvedValue(mockDoctor as any);
      jest.useFakeTimers().setSystemTime(new Date('2026-06-12T10:55:00'));
      jest.spyOn(customRepo, 'find').mockResolvedValue([]);
      jest.spyOn(recurringRepo, 'find').mockResolvedValue([
        {
          id: 101,
          dayOfWeek: 'Friday',
          startTime: '10:00',
          endTime: '11:00',
          doctor: mockDoctor,
        },
      ] as any);
      jest.spyOn(appointmentRepo, 'find').mockResolvedValue([]);

      // 10:00 - 10:15, 10:15 - 10:30, 10:30 - 10:45, 10:45 - 11:00 are all in the past (before 10:55)
      // Note: 10:45 - 11:00 starts at 10:45 which is before 10:55, so it's a past slot
      await expect(
        service.generateSlotsForDoctor(1, '2026-06-12', '15'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
