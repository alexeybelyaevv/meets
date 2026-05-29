import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import type { AuthUserDto, UserDto } from '@meets/shared';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { AppleLoginDto } from './dto/apple-login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TelegramLoginDto } from './dto/telegram-login.dto';
import type { JwtUser } from './strategies/jwt-access.strategy';

type AuthenticatedRequest = Request & {
  user: JwtUser;
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('apple')
  loginWithApple(@Body() dto: AppleLoginDto): Promise<AuthUserDto> {
    return this.authService.loginWithApple(dto);
  }

  @Post('google')
  loginWithGoogle(@Body() dto: GoogleLoginDto): Promise<AuthUserDto> {
    return this.authService.loginWithGoogle(dto);
  }

  @Post('telegram')
  loginWithTelegram(@Body() dto: TelegramLoginDto): Promise<AuthUserDto> {
    return this.authService.loginWithTelegram(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthUserDto> {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt-access'))
  async me(@Req() request: AuthenticatedRequest): Promise<UserDto> {
    const user = await this.usersService.findByIdOrThrow(request.user.sub);
    return this.usersService.toDto(user);
  }
}
