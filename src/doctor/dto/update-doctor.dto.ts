import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDoctorDto {
  @ApiProperty({
    example: 'Dr. John Smith',
    required: false,
    description: 'Updated full name',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({
    example: 'Cardiology',
    required: false,
    description: 'Updated medical specialty',
  })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiProperty({
    example: 12,
    required: false,
    description: 'Updated years of experience',
  })
  @IsOptional()
  @IsNumber()
  experience?: number;

  @ApiProperty({
    example: 'MD, DM (Cardiology)',
    required: false,
    description: 'Updated credentials',
  })
  @IsOptional()
  @IsString()
  qualification?: string;

  @ApiProperty({
    example: 500,
    required: false,
    description: 'Updated consultation fee',
  })
  @IsOptional()
  @IsNumber()
  consultationFee?: number;

  @ApiProperty({
    example: 'Mon-Fri 9AM-5PM',
    required: false,
    description: 'Updated availability schedule',
  })
  @IsOptional()
  @IsString()
  availability?: string;

  @ApiProperty({
    example: 'Specialist in cardiovascular health',
    required: false,
    description: 'Updated biography',
  })
  @IsOptional()
  @IsString()
  profileDetails?: string;
}
