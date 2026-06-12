import { IsOptional, IsString, Matches } from 'class-validator';
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

  @ApiProperty({ example: '1998-06-20', required: false, description: 'Updated Date of Birth (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dob must be in YYYY-MM-DD format' })
  dob?: string;

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
