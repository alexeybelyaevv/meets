import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { AuthProvider as PrismaAuthProvider, type User } from '@prisma/client';
import type { AuthProvider, AuthTokensDto, AuthUserDto } from '@meets/shared';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import type { AppleLoginDto } from './dto/apple-login.dto';
import type { GoogleLoginDto } from './dto/google-login.dto';
import type { RefreshTokenDto } from './dto/refresh-token.dto';
import type { TelegramLoginDto } from './dto/telegram-login.dto';
import { AppleTokenVerifierService } from './providers/apple-token-verifier.service';
import { GoogleTokenVerifierService } from './providers/google-token-verifier.service';
import { TelegramTokenVerifierService } from './providers/telegram-token-verifier.service';
import type { VerifiedSocialProfile } from './types/verified-social-profile.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly appleVerifier: AppleTokenVerifierService,
    private readonly googleVerifier: GoogleTokenVerifierService,
    private readonly telegramVerifier: TelegramTokenVerifierService,
  ) {}

  async loginWithApple(dto: AppleLoginDto): Promise<AuthUserDto> {
    if (!dto.identityToken) {
      throw new UnauthorizedException('Apple identity token is required');
    }

    const profile = await this.appleVerifier.verify(
      dto.identityToken,
      dto.fullName,
    );
    return this.createAuthResponse(
      await this.findOrCreateUserFromSocialProfile(profile),
    );
  }

  async loginWithGoogle(dto: GoogleLoginDto): Promise<AuthUserDto> {
    if (!dto.idToken) {
      throw new UnauthorizedException('Google ID token is required');
    }

    const profile = await this.googleVerifier.verify(dto.idToken);
    return this.createAuthResponse(
      await this.findOrCreateUserFromSocialProfile(profile),
    );
  }

  async loginWithTelegram(dto: TelegramLoginDto): Promise<AuthUserDto> {
    const profile = this.telegramVerifier.verify(dto);
    return this.createAuthResponse(
      await this.findOrCreateUserFromSocialProfile(profile),
    );
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthUserDto> {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    const user = await this.usersService.findByIdOrThrow(payload.sub);
    const storedToken = await this.findMatchingRefreshToken(
      user.id,
      dto.refreshToken,
    );

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    return this.createAuthResponse(user);
  }

  async logout(dto: RefreshTokenDto) {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    const storedToken = await this.findMatchingRefreshToken(
      payload.sub,
      dto.refreshToken,
    );

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    return { ok: true };
  }

  async findOrCreateUserFromSocialProfile(
    profile: VerifiedSocialProfile,
  ): Promise<User> {
    const provider = this.toPrismaProvider(profile.provider);

    const existingAccount = await this.prisma.socialAccount.findUnique({
      where: {
        provider_providerUserId: {
          provider,
          providerUserId: profile.providerUserId,
        },
      },
      include: { user: true },
    });

    if (existingAccount) {
      await this.prisma.socialAccount.update({
        where: { id: existingAccount.id },
        data: {
          email: profile.email ?? null,
          username: profile.username ?? null,
          avatarUrl: profile.avatarUrl ?? null,
        },
      });

      if (
        (!existingAccount.user.name && profile.name) ||
        (!existingAccount.user.avatarUrl && profile.avatarUrl)
      ) {
        return this.prisma.user.update({
          where: { id: existingAccount.userId },
          data: {
            name: existingAccount.user.name ?? profile.name ?? null,
            avatarUrl:
              existingAccount.user.avatarUrl ?? profile.avatarUrl ?? null,
          },
        });
      }

      return existingAccount.user;
    }

    const verifiedEmail =
      profile.email && profile.emailVerified ? profile.email : null;
    const user = verifiedEmail
      ? await this.prisma.user.findUnique({ where: { email: verifiedEmail } })
      : null;

    if (user) {
      await this.assertProviderNotLinked(user.id, provider);
      await this.prisma.socialAccount.create({
        data: this.socialAccountCreateData(user.id, provider, profile),
      });
      return user;
    }

    return this.prisma.user.create({
      data: {
        email: verifiedEmail,
        name: profile.name ?? null,
        avatarUrl: profile.avatarUrl ?? null,
        socialAccounts: {
          create: {
            provider,
            providerUserId: profile.providerUserId,
            email: profile.email ?? null,
            username: profile.username ?? null,
            avatarUrl: profile.avatarUrl ?? null,
          },
        },
      },
    });
  }

  private async createAuthResponse(user: User): Promise<AuthUserDto> {
    return {
      user: this.usersService.toDto(user),
      tokens: await this.issueTokens(user.id),
    };
  }

  private async issueTokens(userId: string): Promise<AuthTokensDto> {
    const accessToken = await this.jwtService.signAsync(
      { sub: userId },
      {
        secret: process.env.JWT_ACCESS_SECRET ?? 'change-me-access',
        expiresIn: this.getJwtExpiresIn(
          process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
        ),
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, jti: randomUUID() },
      {
        secret: process.env.JWT_REFRESH_SECRET ?? 'change-me-refresh',
        expiresIn: this.getJwtExpiresIn(
          process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
        ),
      },
    );

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: await bcrypt.hash(refreshToken, 12),
        expiresAt: this.getRefreshTokenExpiryDate(),
      },
    });

    return { accessToken, refreshToken };
  }

  private async verifyRefreshToken(refreshToken?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      return await this.jwtService.verifyAsync<{ sub: string }>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? 'change-me-refresh',
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async findMatchingRefreshToken(userId: string, refreshToken: string) {
    const storedTokens = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    for (const storedToken of storedTokens) {
      if (await bcrypt.compare(refreshToken, storedToken.tokenHash)) {
        return storedToken;
      }
    }

    throw new UnauthorizedException('Refresh token has been revoked');
  }

  private async assertProviderNotLinked(
    userId: string,
    provider: PrismaAuthProvider,
  ) {
    const existingProviderForUser = await this.prisma.socialAccount.findUnique({
      where: {
        userId_provider: {
          userId,
          provider,
        },
      },
    });

    if (existingProviderForUser) {
      throw new ConflictException(
        'User already has an account for this provider',
      );
    }
  }

  private socialAccountCreateData(
    userId: string,
    provider: PrismaAuthProvider,
    profile: VerifiedSocialProfile,
  ) {
    return {
      userId,
      provider,
      providerUserId: profile.providerUserId,
      email: profile.email ?? null,
      username: profile.username ?? null,
      avatarUrl: profile.avatarUrl ?? null,
    };
  }

  private toPrismaProvider(provider: AuthProvider): PrismaAuthProvider {
    switch (provider) {
      case 'apple':
        return PrismaAuthProvider.APPLE;
      case 'google':
        return PrismaAuthProvider.GOOGLE;
      case 'telegram':
        return PrismaAuthProvider.TELEGRAM;
    }
  }

  private getRefreshTokenExpiryDate() {
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? '30d';
    const match = /^(\d+)([smhd])$/.exec(expiresIn);

    if (!match) {
      return new Date(Date.now() + Number(expiresIn) * 1000);
    }

    const value = Number(match[1]);
    const unit = match[2] as 's' | 'm' | 'h' | 'd';
    const unitMs = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    }[unit];

    return new Date(Date.now() + value * unitMs);
  }

  private getJwtExpiresIn(value: string): JwtSignOptions['expiresIn'] {
    return value as JwtSignOptions['expiresIn'];
  }
}
