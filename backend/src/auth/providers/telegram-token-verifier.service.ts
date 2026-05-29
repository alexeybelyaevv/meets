import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import type { TelegramLoginDto } from '../dto/telegram-login.dto';
import type { VerifiedSocialProfile } from '../types/verified-social-profile.type';

const maxTelegramAuthAgeSeconds = 24 * 60 * 60;

@Injectable()
export class TelegramTokenVerifierService {
  verify(payload: TelegramLoginDto): VerifiedSocialProfile {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      throw new InternalServerErrorException(
        'Telegram bot token is not configured',
      );
    }

    if (!payload.id || !payload.auth_date || !payload.hash) {
      throw new UnauthorizedException('Invalid Telegram login payload');
    }

    const ageSeconds =
      Math.floor(Date.now() / 1000) - Number(payload.auth_date);
    if (ageSeconds < 0 || ageSeconds > maxTelegramAuthAgeSeconds) {
      throw new UnauthorizedException('Telegram login payload expired');
    }

    const dataCheckString = Object.entries(payload)
      .filter(
        ([key, value]) =>
          key !== 'hash' &&
          value !== undefined &&
          value !== null &&
          value !== '',
      )
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => `${key}=${String(value)}`)
      .join('\n');

    const secretKey = createHash('sha256').update(botToken).digest();
    const calculatedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (!this.safeCompare(calculatedHash, payload.hash)) {
      throw new UnauthorizedException('Invalid Telegram login hash');
    }

    return {
      provider: 'telegram',
      providerUserId: String(payload.id),
      username: payload.username ?? null,
      name:
        [payload.first_name, payload.last_name]
          .filter(Boolean)
          .join(' ')
          .trim() || null,
      avatarUrl: payload.photo_url ?? null,
    };
  }

  private safeCompare(left: string, right: string) {
    const leftBuffer = Buffer.from(left, 'hex');
    const rightBuffer = Buffer.from(right, 'hex');
    return (
      leftBuffer.length === rightBuffer.length &&
      timingSafeEqual(leftBuffer, rightBuffer)
    );
  }
}
