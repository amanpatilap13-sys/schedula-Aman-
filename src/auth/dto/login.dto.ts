import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'The registered email of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'The registered password of the user' })
  @IsNotEmpty()
  password: string;
}
