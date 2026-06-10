import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user (DOCTOR or PATIENT)' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and generate JWT token' })
  @ApiResponse({ status: 201, description: 'Authentication successful, returns JWT token.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
