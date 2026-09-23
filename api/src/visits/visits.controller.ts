import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateVisitDto } from './dto/create-visit.dto';
import { VisitsService } from './visits.service';

@ApiTags('visits')
@Controller()
export class VisitsController {
  constructor(private readonly visits: VisitsService) {}

  @Get('people/:id/visits')
  listByPerson(@Param('id') id: string) {
    return this.visits.listByPerson(id);
  }

  @Post('visits')
  record(@Body() dto: CreateVisitDto) {
    return this.visits.record(dto);
  }
}
