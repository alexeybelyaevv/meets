export type AppleFullNameDto = {
  givenName?: string;
  familyName?: string;
};

export class AppleLoginDto {
  identityToken!: string;
  fullName?: AppleFullNameDto;
}
