import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDoctorDto {
  @ApiProperty({ example: 'Dr. John Smith', description: 'Full professional name' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'Cardiology', description: 'Medical specialty' })
  @IsString()
  specialization: string;

  @ApiProperty({ example: 12, description: 'Years of professional experience' })
  @IsNumber()
  experience: number;

  @ApiProperty({ example: 'MD, DM (Cardiology)', description: 'Medical degree and credentials' })
  @IsString()
  qualification: string;

  @ApiProperty({ example: 500, description: 'Consultation fee in local currency' })
  @IsNumber()
  consultationFee: number;

  @ApiProperty({ example: 'Mon-Fri 9AM-5PM', description: 'Weekly availability details' })
  @IsString()
  availability: string;

  @ApiProperty({ example: 'Specialist in cardiovascular health', required: false, description: 'Detailed biography or notes' })
  @IsOptional()
  @IsString()
  profileDetails?: string;
}
