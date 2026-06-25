import type { CreateEventDto as SharedCreateEventDto } from '@meets/shared';

export class CreateEventDto implements SharedCreateEventDto {
  title!: string;
  description?: string | null;
  categories!: string[];
  photos?: string[];
  startsAt!: string;
  locationName!: string;
  locationAddress?: string | null;
  latitude!: number;
  longitude!: number;
  capacity?: number | null;
  peopleAlreadyThere?: number | null;
  priceType!: 'free' | 'paid';
  priceAmount?: number | null;
  currency?: 'EUR';
  bringItems?: string | null;
  minAge?: number | null;
  maxAge?: number | null;
}
