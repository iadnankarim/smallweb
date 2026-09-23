import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PeopleService } from './people.service';
import { Person } from './person.schema';

@ApiTags('people')
@Controller('people')
export class PeopleController {
  constructor(private readonly people: PeopleService) {}

  @Get()
  findAll(): Promise<Person[]> {
    return this.people.findAll();
  }
}
