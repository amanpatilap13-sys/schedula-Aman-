import { IsString, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePatientDto {
  @ApiProperty({ example: 'Jane Doe', description: 'Full name of the patient' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '1998-06-20', description: 'Date of Birth of the patient (YYYY-MM-DD)' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dob must be in YYYY-MM-DD format' })
  dob: string;

  @ApiProperty({ example: 'Female', description: 'Gender of the patient' })
  @IsString()
  gender: string;

  @ApiProperty({ example: '+1234567890', description: 'Contact phone number' })
  @IsString()
  contactDetails: string;

  @ApiProperty({
    example: 'No chronic conditions, allergic to penicillin',
    required: false,
    description: 'Medical history or details',
  })
  @IsOptional()
  @IsString()
  healthInfo?: string;
}
