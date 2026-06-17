import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Ip,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  register(@Body() dto: RegisterDto, @Ip() ip: string) {
    return this.authService.register(dto, ip);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and get JWT token' })
  login(@Body() dto: LoginDto, @Ip() ip: string) {
    return this.authService.login(dto, ip);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@Request() req: any) {
    return this.authService.getMe(req.user.id);
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto, @Ip() ip: string) {
    return this.authService.updateProfile(req.user.id, dto, ip);
  }

  @Post('password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user password' })
  updatePassword(@Request() req: any, @Body() dto: UpdatePasswordDto, @Ip() ip: string) {
    return this.authService.updatePassword(req.user.id, dto, ip);
  }

  @Post('ssh-key')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate a new SSH key pair' })
  generateSshKey(@Request() req: any, @Ip() ip: string) {
    return this.authService.generateSshKey(req.user.id, ip);
  }

  @Post('github')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Connect GitHub via Personal Access Token' })
  connectGithub(@Request() req: any, @Body('token') token: string, @Ip() ip: string) {
    return this.authService.connectGithub(req.user.id, token, ip);
  }

  @Delete('github')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disconnect GitHub account' })
  disconnectGithub(@Request() req: any, @Ip() ip: string) {
    return this.authService.disconnectGithub(req.user.id, ip);
  }
}
