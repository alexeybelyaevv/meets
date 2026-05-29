import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AppleTokenVerifierService } from './providers/apple-token-verifier.service';
import { GoogleTokenVerifierService } from './providers/google-token-verifier.service';
import { TelegramTokenVerifierService } from './providers/telegram-token-verifier.service';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  imports: [JwtModule.register({}), PassportModule, UsersModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AppleTokenVerifierService,
    GoogleTokenVerifierService,
    TelegramTokenVerifierService,
    JwtAccessStrategy,
    JwtRefreshStrategy,
  ],
})
export class AuthModule {}
