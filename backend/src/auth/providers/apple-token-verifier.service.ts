import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { AppleFullNameDto } from '../dto/apple-login.dto';
import type { VerifiedSocialProfile } from '../types/verified-social-profile.type';

type AppleTokenPayload = {
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
};

const appleIssuer = 'https://appleid.apple.com';
const appleJwks = createRemoteJWKSet(new URL(`${appleIssuer}/auth/keys`));
const isString = (value: string | undefined): value is string => Boolean(value);

@Injectable()
export class AppleTokenVerifierService {
  async verify(
    identityToken: string,
    fullName?: AppleFullNameDto,
  ): Promise<VerifiedSocialProfile> {
    const audiences = [
      process.env.APPLE_BUNDLE_ID,
      process.env.APPLE_CLIENT_ID,
    ].filter(isString);

    if (audiences.length === 0) {
      throw new InternalServerErrorException(
        'Apple audience is not configured',
      );
    }

    try {
      const { payload } = await jwtVerify(identityToken, appleJwks, {
        issuer: appleIssuer,
        audience: audiences,
      });
      const applePayload = payload as AppleTokenPayload;

      if (!applePayload.sub) {
        throw new UnauthorizedException('Apple token is missing subject');
      }

      return {
        provider: 'apple',
        providerUserId: applePayload.sub,
        email: applePayload.email ?? null,
        emailVerified:
          applePayload.email_verified === true ||
          applePayload.email_verified === 'true',
        name: this.formatName(fullName),
      };
    } catch (error) {
      if (
        error instanceof InternalServerErrorException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new UnauthorizedException('Invalid Apple identity token');
    }
  }

  private formatName(fullName?: AppleFullNameDto) {
    const name = [fullName?.givenName, fullName?.familyName]
      .filter(Boolean)
      .join(' ')
      .trim();
    return name.length > 0 ? name : null;
  }
}
