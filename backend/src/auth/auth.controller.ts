import { Controller, UnauthorizedException,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Ip,
  Delete,
  Res,
  Param,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response, Request as ExpressRequest } from 'express';
import { ApiTags,
  ApiOperation,
  ApiCookieAuth,
  ApiParam,
  ApiResponse,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from '@generated/prisma';
import { generateCsrfToken } from '../csrf/csrf.config';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('csrf-token')
  @ApiOperation({ summary: 'Get CSRF token' })
  getCsrfToken(@Req() req: ExpressRequest, @Res({ passthrough: true }) res: Response) {
    const csrfToken = generateCsrfToken(req, res);
    return { csrfToken };
  }

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per 1 minute
  @ApiOperation({ summary: 'Register a new user' })
  async register(
    @Body() dto: RegisterDto,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.authService.register(dto, ip);
    res.cookie('access_token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return data;
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per 1 minute
  @ApiOperation({ summary: 'Login and get JWT token' })
  async login(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.authService.login(dto, ip);
    if (data.token) {
      res.cookie('access_token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }
    return data;
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout and clear cookie' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@Request() req: any) {
    return this.authService.getMe(req.user.id);
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update user profile' })
  updateProfile(
    @Request() req: any,
    @Body() dto: UpdateProfileDto,
    @Ip() ip: string,
  ) {
    return this.authService.updateProfile(req.user.id, dto, ip);
  }

  @Post('password')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Update user password' })
  updatePassword(
    @Request() req: any,
    @Body() dto: UpdatePasswordDto,
    @Ip() ip: string,
  ) {
    return this.authService.updatePassword(req.user.id, dto, ip);
  }

  @Post('ssh-key')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Generate a new SSH key pair' })
  generateSshKey(@Request() req: any, @Ip() ip: string) {
    return this.authService.generateSshKey(req.user.id, ip);
  }

  @Post('github')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Connect GitHub via Personal Access Token' })
  connectGithub(
    @Request() req: any,
    @Body('token') token: string,
    @Ip() ip: string,
  ) {
    return this.authService.connectGithub(req.user.id, token, ip);
  }

  @Delete('github')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Disconnect GitHub account' })
  disconnectGithub(@Request() req: any, @Ip() ip: string) {
    return this.authService.disconnectGithub(req.user.id, ip);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete own account and all resources' })
  deleteAccount(
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('access_token');
    return this.authService.deleteAccount(req.user.id);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin: Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of all users and their project counts.',
  })
  getAllUsers() {
    return this.authService.getAllUsers();
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin: Get user by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the user' })
  @ApiResponse({
    status: 200,
    description:
      'Returns detailed information of a specific user including their projects.',
  })
  @ApiResponse({ status: 400, description: 'User not found.' })
  getUserById(@Param('id') id: string) {
    return this.authService.getUserById(id);
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin: Delete user by ID and all resources' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the user to permanently delete',
  })
  @ApiResponse({
    status: 200,
    description:
      'User and all associated containers/projects successfully deleted.',
  })
  deleteUserById(@Param('id') id: string) {
    return this.authService.deleteAccount(id);
  }

  @Post('2fa/setup')
  @UseGuards(JwtAuthGuard)
  async setup2fa(@Request() req: any) {
    return this.authService.setup2fa(req.user.id);
  }

  @Post('2fa/verify')
  async verify2fa(
    @Body() body: { token: string; setupToken: string; isSetup: boolean },
    @Request() req: any,
    @Res({ passthrough: true }) res: Response
  ) {
    // We need to decode the setupToken (or tempToken) to get the user ID.
    let payload;
    try {
      payload = this.authService['jwtService'].verify(body.setupToken);
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired 2FA session');
    }
    
    const data = await this.authService.verify2fa(payload.sub, body.token, body.isSetup, req.ip || req.connection.remoteAddress);
    
    if (data.token) {
      res.cookie('access_token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }
    
    return data;
  }

}