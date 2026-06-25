import { BadRequestException, Injectable } from '@nestjs/common';
import { EventPriceType, type Event } from '@prisma/client';
import type { EventDto } from '@meets/shared';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<EventDto[]> {
    const events = await this.prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return events.map((event) => this.toDto(event));
  }

  async create(dto: CreateEventDto): Promise<EventDto> {
    this.assertCreateDto(dto);
    const startsAt = new Date(dto.startsAt);

    const event = await this.prisma.event.create({
      data: {
        title: dto.title.trim(),
        description: this.cleanOptionalString(dto.description),
        categories: this.cleanStringArray(dto.categories),
        photos: this.cleanStringArray(dto.photos ?? []),
        startsAt,
        locationName: dto.locationName.trim(),
        locationAddress: this.cleanOptionalString(dto.locationAddress),
        latitude: dto.latitude,
        longitude: dto.longitude,
        capacity: this.cleanOptionalNumber(dto.capacity),
        peopleAlreadyThere:
          this.cleanOptionalNumber(dto.peopleAlreadyThere) ?? 0,
        priceType:
          dto.priceType === 'paid' ? EventPriceType.PAID : EventPriceType.FREE,
        priceAmount: this.cleanOptionalNumber(dto.priceAmount),
        currency: dto.currency ?? 'EUR',
        bringItems: this.cleanOptionalString(dto.bringItems),
        minAge: this.cleanOptionalNumber(dto.minAge),
        maxAge: this.cleanOptionalNumber(dto.maxAge),
      },
    });

    return this.toDto(event);
  }

  private toDto(event: Event): EventDto {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      categories: event.categories,
      photos: event.photos,
      startsAt: event.startsAt.toISOString(),
      locationName: event.locationName,
      locationAddress: event.locationAddress,
      capacity: event.capacity,
      peopleAlreadyThere: event.peopleAlreadyThere,
      priceType: event.priceType === EventPriceType.PAID ? 'paid' : 'free',
      priceAmount: event.priceAmount,
      currency: 'EUR',
      bringItems: event.bringItems,
      minAge: event.minAge,
      maxAge: event.maxAge,
      latitude: event.latitude,
      longitude: event.longitude,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };
  }

  private assertCreateDto(dto: CreateEventDto) {
    if (!dto.title?.trim()) {
      throw new BadRequestException('Event title is required');
    }

    if (!Array.isArray(dto.categories)) {
      throw new BadRequestException('Event categories must be an array');
    }

    if (dto.photos !== undefined && !Array.isArray(dto.photos)) {
      throw new BadRequestException('Event photos must be an array');
    }

    if (!dto.startsAt?.trim() || Number.isNaN(Date.parse(dto.startsAt))) {
      throw new BadRequestException('Event start date is required');
    }

    if (!dto.locationName?.trim()) {
      throw new BadRequestException('Event location name is required');
    }

    if (!Number.isFinite(dto.latitude) || !Number.isFinite(dto.longitude)) {
      throw new BadRequestException('Event coordinates are required');
    }

    if (dto.latitude < -90 || dto.latitude > 90) {
      throw new BadRequestException(
        'Event latitude must be between -90 and 90',
      );
    }

    if (dto.longitude < -180 || dto.longitude > 180) {
      throw new BadRequestException(
        'Event longitude must be between -180 and 180',
      );
    }

    if (dto.priceType !== 'free' && dto.priceType !== 'paid') {
      throw new BadRequestException('Event price type must be free or paid');
    }

    if (dto.currency && dto.currency !== 'EUR') {
      throw new BadRequestException('Event currency must be EUR');
    }
  }

  private cleanOptionalString(value?: string | null) {
    const nextValue = value?.trim();
    return nextValue ? nextValue : null;
  }

  private cleanStringArray(values: string[]) {
    return values
      .filter((value) => typeof value === 'string')
      .map((value) => value.trim())
      .filter((value, index, array) => value && array.indexOf(value) === index);
  }

  private cleanOptionalNumber(value?: number | null) {
    return Number.isFinite(value) ? value : null;
  }
}
