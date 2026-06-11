import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CustomOverrideSlotDto {
  @ApiProperty({
    example: '14:00',
    description: 'Start time in 24-hour format (HH:MM)',
  })
  @IsString()
  startTime: string;

  @ApiProperty({
    example: '15:00',
    description: 'End time in 24-hour format (HH:MM)',
  })
  @IsString()
  endTime: string;
}

export class CreateCustomOverrideDto {
  @ApiProperty({
    example: '2026-06-15',
    description: 'Target date in YYYY-MM-DD format',
  })
  @IsString()
  date: string;

  @ApiProperty({
    type: [CustomOverrideSlotDto],
    description:
      'List of custom availability time windows. Send empty array for complete unavailability on this date.',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomOverrideSlotDto)
  slots: CustomOverrideSlotDto[];
}
