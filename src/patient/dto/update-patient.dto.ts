import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePatientDto {
  @ApiProperty({
    example: 'Jane Doe',
    required: false,
    description: 'Updated full name',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ example: 28, required: false, description: 'Updated age' })
  @IsOptional()
  @IsNumber()
  age?: number;

  @ApiProperty({
    example: 'Female',
    required: false,
    description: 'Updated gender',
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({
    example: '+9876543210',
    required: false,
    description: 'Updated contact details',
  })
  @IsOptional()
  @IsString()
  contactDetails?: string;

  @ApiProperty({
    example: 'No chronic conditions, allergic to penicillin',
    required: false,
    description: 'Updated medical details',
  })
  @IsOptional()
  @IsString()
  healthInfo?: string;
}
