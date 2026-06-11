import { IsString, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const validDays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export class CreateRecurringAvailabilityDto {
  @ApiProperty({
    example: 'Monday',
    description: 'Day of the week (Monday - Sunday)',
    enum: validDays,
  })
  @IsString()
  @IsIn(validDays, {
    message: 'dayOfWeek must be a valid day (e.g. Monday, Tuesday)',
  })
  dayOfWeek: string;

  @ApiProperty({
    example: '09:00',
    description: 'Start time in 24-hour format (HH:MM)',
  })
  @IsString()
  startTime: string;

  @ApiProperty({
    example: '13:00',
    description: 'End time in 24-hour format (HH:MM)',
  })
  @IsString()
  endTime: string;
}

export class UpdateRecurringAvailabilityDto {
  @ApiProperty({
    example: 'Monday',
    description: 'Day of the week (Monday - Sunday)',
    enum: validDays,
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(validDays, {
    message: 'dayOfWeek must be a valid day (e.g. Monday, Tuesday)',
  })
  dayOfWeek?: string;

  @ApiProperty({
    example: '09:00',
    description: 'Start time in 24-hour format (HH:MM)',
    required: false,
  })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiProperty({
    example: '13:00',
    description: 'End time in 24-hour format (HH:MM)',
    required: false,
  })
  @IsOptional()
  @IsString()
  endTime?: string;
}
