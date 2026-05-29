import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import type { VerifiedSocialProfile } from '../types/verified-social-profile.type';

const isString = (value: string | undefined): value is string => Boolean(value);

@Injectable()
export class GoogleTokenVerifierService {
  private readonly client = new OAuth2Client();

  async verify(idToken: string): Promise<VerifiedSocialProfile> {
    const audiences = [
      process.env.GOOGLE_IOS_CLIENT_ID,
      process.env.GOOGLE_WEB_CLIENT_ID,
    ].filter(isString);

    if (audiences.length === 0) {
      throw new InternalServerErrorException(
        'Google audience is not configured',
      );
    }

    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: audiences,
      });
      const payload = ticket.getPayload();

      if (!payload?.sub) {
        throw new UnauthorizedException('Google token is missing subject');
      }

      if (!payload.email_verified) {
        throw new UnauthorizedException('Google email is not verified');
      }

      return {
        provider: 'google',
        providerUserId: payload.sub,
        email: payload.email ?? null,
        emailVerified: payload.email_verified,
        name: payload.name ?? null,
        avatarUrl: payload.picture ?? null,
      };
    } catch (error) {
      if (
        error instanceof InternalServerErrorException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new UnauthorizedException('Invalid Google ID token');
    }
  }
}
