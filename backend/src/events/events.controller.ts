import { Body, Controller, Get, Post } from '@nestjs/common';
import type { EventDto } from '@meets/shared';
import { CreateEventDto } from './dto/create-event.dto';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll(): Promise<EventDto[]> {
    return this.eventsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateEventDto): Promise<EventDto> {
    return this.eventsService.create(dto);
  }
}
