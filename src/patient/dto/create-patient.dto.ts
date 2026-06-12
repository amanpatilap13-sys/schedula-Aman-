import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePatientDto {
  @ApiProperty({ example: 'Jane Doe', description: 'Full name of the patient' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 28, description: 'Age of the patient' })
  @IsNumber()
  age: number;

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
