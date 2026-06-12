import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Doctor } from './doctor.entity';
import { RecurringAvailability } from './recurring-availability.entity';
import { CustomAvailability } from './custom-availability.entity';
import { Appointment } from '../appointment/appointment.entity';
import { UsersService } from '../users/users.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import {
  CreateRecurringAvailabilityDto,
  UpdateRecurringAvailabilityDto,
} from './dto/recurring-availability.dto';
import { CreateCustomOverrideDto } from './dto/custom-override.dto';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,

    @InjectRepository(RecurringAvailability)
    private recurringAvailabilityRepository: Repository<RecurringAvailability>,

    @InjectRepository(CustomAvailability)
    private customAvailabilityRepository: Repository<CustomAvailability>,

    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,

    private usersService: UsersService,
  ) {}

  async createProfile(userId: number, createDoctorDto: CreateDoctorDto) {
    const existingProfile = await this.doctorRepository.findOne({
      where: {
        user: { id: userId },
      },
      relations: { user: true },
    });

    if (existingProfile) {
      throw new ConflictException('Doctor profile already exists');
    }

    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const doctor = this.doctorRepository.create({
      ...createDoctorDto,
      user,
    });

    return this.doctorRepository.save(doctor);
  }

  async getProfile(userId: number) {
    const profile = await this.doctorRepository.findOne({
      where: {
        user: { id: userId },
      },
      relations: { user: true },
    });

    if (!profile) {
      throw new NotFoundException('Doctor profile not found');
    }

    return profile;
  }

  async updateProfile(userId: number, updateDoctorDto: UpdateDoctorDto) {
    const profile = await this.doctorRepository.findOne({
      where: {
        user: { id: userId },
      },
      relations: { user: true },
    });

    if (!profile) {
      throw new NotFoundException('Doctor profile not found');
    }

    Object.assign(profile, updateDoctorDto);

    return this.doctorRepository.save(profile);
  }

  async findAll(
    search?: string,
    specialization?: string,
    page = 1,
    limit = 10,
  ) {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be greater than 0');
    }

    const query = this.doctorRepository.createQueryBuilder('doctor');

    if (search) {
      query.andWhere('LOWER(doctor.fullName) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    if (specialization) {
      query.andWhere('LOWER(doctor.specialization) = LOWER(:specialization)', {
        specialization,
      });
    }

    query.skip((page - 1) * limit);
    query.take(limit);

    return query.getMany();
  }

  async findOne(id: number) {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  // --- Doctor Availability Business Logic ---

  private getDayOfWeek(dateString: string): string {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      throw new BadRequestException('Invalid date format. Expected YYYY-MM-DD');
    }

    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const parts = dateString.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    const dateObj = new Date(Date.UTC(year, month, day));
    if (isNaN(dateObj.getTime())) {
      throw new BadRequestException('Invalid date');
    }

    if (
      dateObj.getUTCFullYear() !== year ||
      dateObj.getUTCMonth() !== month ||
      dateObj.getUTCDate() !== day
    ) {
      throw new BadRequestException(
        'Provided date does not exist on the calendar',
      );
    }

    return days[dateObj.getUTCDay()];
  }

  private validateTimeSlot(startTime: string, endTime: string) {
    const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      throw new BadRequestException(
        'Invalid time format. Expected HH:MM in 24-hour format',
      );
    }

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    if (startMin >= endMin) {
      throw new BadRequestException('Start time must be before end time');
    }
  }

  private checkOverlap(
    slot1: { startTime: string; endTime: string },
    slot2: { startTime: string; endTime: string },
  ): boolean {
    return slot1.startTime < slot2.endTime && slot2.startTime < slot1.endTime;
  }

  async addRecurringAvailability(
    userId: number,
    dto: CreateRecurringAvailabilityDto,
  ) {
    const doctor = await this.doctorRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    this.validateTimeSlot(dto.startTime, dto.endTime);

    // Fetch existing recurring slots for this day of the week
    const existingSlots = await this.recurringAvailabilityRepository.find({
      where: {
        doctor: { id: doctor.id },
        dayOfWeek: dto.dayOfWeek,
      },
    });

    // Overlap check
    for (const slot of existingSlots) {
      if (this.checkOverlap(slot, dto)) {
        throw new ConflictException(
          `Time slot overlaps with existing recurring availability: ${slot.startTime} - ${slot.endTime}`,
        );
      }
    }

    const newSlot = this.recurringAvailabilityRepository.create({
      dayOfWeek: dto.dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
      doctor,
    });

    return this.recurringAvailabilityRepository.save(newSlot);
  }

  async getRecurringAvailability(userId: number) {
    const doctor = await this.doctorRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    return this.recurringAvailabilityRepository.find({
      where: { doctor: { id: doctor.id } },
      order: {
        dayOfWeek: 'ASC',
        startTime: 'ASC',
      },
    });
  }

  async updateRecurringAvailability(
    userId: number,
    id: number,
    dto: UpdateRecurringAvailabilityDto,
  ) {
    const doctor = await this.doctorRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    const slot = await this.recurringAvailabilityRepository.findOne({
      where: { id },
      relations: { doctor: true },
    });
    if (!slot) {
      throw new NotFoundException('Recurring availability slot not found');
    }

    if (slot.doctor.id !== doctor.id) {
      throw new ForbiddenException('You do not own this availability slot');
    }

    const updatedDay = dto.dayOfWeek ?? slot.dayOfWeek;
    const updatedStart = dto.startTime ?? slot.startTime;
    const updatedEnd = dto.endTime ?? slot.endTime;

    this.validateTimeSlot(updatedStart, updatedEnd);

    // Overlap check with other slots (excluding the current slot id)
    const query = this.recurringAvailabilityRepository
      .createQueryBuilder('ra')
      .where('ra.doctorId = :doctorId', { doctorId: doctor.id })
      .andWhere('ra.dayOfWeek = :dayOfWeek', { dayOfWeek: updatedDay })
      .andWhere('ra.id != :id', { id });

    const otherSlots = await query.getMany();

    const newSlotTemp = { startTime: updatedStart, endTime: updatedEnd };
    for (const other of otherSlots) {
      if (this.checkOverlap(other, newSlotTemp)) {
        throw new ConflictException(
          `Time slot overlaps with existing recurring availability: ${other.startTime} - ${other.endTime}`,
        );
      }
    }

    slot.dayOfWeek = updatedDay;
    slot.startTime = updatedStart;
    slot.endTime = updatedEnd;

    return this.recurringAvailabilityRepository.save(slot);
  }

  async deleteRecurringAvailability(userId: number, id: number) {
    const doctor = await this.doctorRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    const slot = await this.recurringAvailabilityRepository.findOne({
      where: { id },
      relations: { doctor: true },
    });
    if (!slot) {
      throw new NotFoundException('Recurring availability slot not found');
    }

    if (slot.doctor.id !== doctor.id) {
      throw new ForbiddenException('You do not own this availability slot');
    }

    await this.recurringAvailabilityRepository.remove(slot);
    return { message: 'Recurring availability slot deleted successfully' };
  }

  async setCustomOverride(userId: number, dto: CreateCustomOverrideDto) {
    const doctor = await this.doctorRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    // Validate date and get day of week (just for parsing validity checking)
    this.getDayOfWeek(dto.date);

    // Delete existing custom overrides for this date and doctor
    await this.customAvailabilityRepository.delete({
      doctor: { id: doctor.id },
      date: dto.date,
    });

    if (dto.slots.length === 0) {
      // Complete unavailability override
      const override = this.customAvailabilityRepository.create({
        date: dto.date,
        isAvailable: false,
        startTime: null,
        endTime: null,
        doctor,
      });
      const saved = await this.customAvailabilityRepository.save(override);
      return [saved];
    }

    // Validate slots & check internal overlaps in the POSTed list
    for (let i = 0; i < dto.slots.length; i++) {
      const current = dto.slots[i];
      this.validateTimeSlot(current.startTime, current.endTime);

      for (let j = i + 1; j < dto.slots.length; j++) {
        if (this.checkOverlap(current, dto.slots[j])) {
          throw new BadRequestException(
            `Overlapping slots provided in override list: ${current.startTime}-${current.endTime} overlaps with ${dto.slots[j].startTime}-${dto.slots[j].endTime}`,
          );
        }
      }
    }

    // Insert new slots
    const newOverrides = dto.slots.map((slot) =>
      this.customAvailabilityRepository.create({
        date: dto.date,
        isAvailable: true,
        startTime: slot.startTime,
        endTime: slot.endTime,
        doctor,
      }),
    );

    return this.customAvailabilityRepository.save(newOverrides);
  }

  async deleteCustomOverride(userId: number, date: string) {
    const doctor = await this.doctorRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    // Validate date format
    this.getDayOfWeek(date);

    const deleteResult = await this.customAvailabilityRepository.delete({
      doctor: { id: doctor.id },
      date,
    });

    if (deleteResult.affected === 0) {
      throw new NotFoundException(`No custom override found for date ${date}`);
    }

    return { message: `Custom override for ${date} removed successfully` };
  }

  async getAvailabilityByDate(doctorId: number, dateString: string) {
    const doctor = await this.doctorRepository.findOne({
      where: { id: doctorId },
    });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const dayOfWeek = this.getDayOfWeek(dateString);

    // 1. Check for custom overrides
    const overrides = await this.customAvailabilityRepository.find({
      where: {
        doctor: { id: doctorId },
        date: dateString,
      },
      order: {
        startTime: 'ASC',
      },
    });

    if (overrides.length > 0) {
      // If the override marks the day as unavailable
      if (!overrides[0].isAvailable) {
        return {
          date: dateString,
          dayOfWeek,
          isOverrideApplied: true,
          slots: [],
        };
      }

      // Return custom slots
      return {
        date: dateString,
        dayOfWeek,
        isOverrideApplied: true,
        slots: overrides.map((o) => ({
          id: o.id,
          startTime: o.startTime!,
          endTime: o.endTime!,
        })),
      };
    }

    // 2. Fall back to recurring availability
    const recurring = await this.recurringAvailabilityRepository.find({
      where: {
        doctor: { id: doctorId },
        dayOfWeek,
      },
      order: {
        startTime: 'ASC',
      },
    });

    return {
      date: dateString,
      dayOfWeek,
      isOverrideApplied: false,
      slots: recurring.map((r) => ({
        id: r.id,
        startTime: r.startTime,
        endTime: r.endTime,
      })),
    };
  }

  async generateSlotsForDoctor(
    doctorId: number,
    dateString: string,
    durationStr: string,
  ) {
    const doctor = await this.doctorRepository.findOne({
      where: { id: doctorId },
    });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Reuse getDayOfWeek for format and calendar date validation
    this.getDayOfWeek(dateString);

    // Ensure date is not in the past relative to current local date
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = now.getMonth() + 1;
    const todayDay = now.getDate();

    const [inputYear, inputMonth, inputDay] = dateString.split('-').map(Number);

    if (
      inputYear < todayYear ||
      (inputYear === todayYear && inputMonth < todayMonth) ||
      (inputYear === todayYear && inputMonth === todayMonth && inputDay < todayDay)
    ) {
      throw new BadRequestException('Date cannot be in the past');
    }

    const duration = parseInt(durationStr, 10);
    if (isNaN(duration) || duration <= 0) {
      throw new BadRequestException('Invalid slot duration');
    }

    const availability = await this.getAvailabilityByDate(doctorId, dateString);

    if (!availability.slots || availability.slots.length === 0) {
      throw new NotFoundException(
        'No availability defined for this doctor on the selected date',
      );
    }

    const allSlots: { startTime: string; endTime: string }[] = [];
    for (const window of availability.slots) {
      const [startH, startM] = window.startTime.split(':').map(Number);
      const [endH, endM] = window.endTime.split(':').map(Number);

      let currentMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;

      while (currentMin + duration <= endMin) {
        const startHStr = String(Math.floor(currentMin / 60)).padStart(2, '0');
        const startMStr = String(currentMin % 60).padStart(2, '0');
        const nextMin = currentMin + duration;
        const endHStr = String(Math.floor(nextMin / 60)).padStart(2, '0');
        const endMStr = String(nextMin % 60).padStart(2, '0');

        allSlots.push({
          startTime: `${startHStr}:${startMStr}`,
          endTime: `${endHStr}:${endMStr}`,
        });

        currentMin += duration;
      }
    }

    // Filter out past slots if date is today
    const isToday =
      inputYear === todayYear &&
      inputMonth === todayMonth &&
      inputDay === todayDay;
    let filteredSlots = allSlots;

    if (isToday) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      filteredSlots = filteredSlots.filter((slot) => {
        const [slotH, slotM] = slot.startTime.split(':').map(Number);
        return (
          slotH > currentHour ||
          (slotH === currentHour && slotM > currentMinute)
        );
      });
    }

    // Fetch booked appointments to filter them out
    const bookedAppointments = await this.appointmentRepository.find({
      where: {
        doctor: { id: doctorId },
        date: dateString,
        status: 'booked',
      },
    });

    filteredSlots = filteredSlots.filter((slot) => {
      const isBooked = bookedAppointments.some(
        (app) => slot.startTime < app.endTime && app.startTime < slot.endTime,
      );
      return !isBooked;
    });

    if (filteredSlots.length === 0) {
      throw new NotFoundException(
        'No available slots for this doctor on the selected date',
      );
    }

    return filteredSlots;
  }
}
