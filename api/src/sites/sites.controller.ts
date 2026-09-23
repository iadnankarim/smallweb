import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateSiteDto } from './dto/create-site.dto';
import { SitesService } from './sites.service';

@ApiTags('sites')
@Controller()
export class SitesController {
  constructor(private readonly sites: SitesService) {}

  @Get('sites')
  listSites() {
    return this.sites.listSummaries();
  }

  @Get('sites/:address')
  async getSite(@Param('address') address: string) {
    const site = await this.sites.getByAddress(address);
    if (!site) throw new NotFoundException(`No site at ${address}.`);
    return site;
  }

  @Post('sites')
  publish(@Body() dto: CreateSiteDto) {
    return this.sites.create(dto);
  }

  @Get('search')
  search(@Query('q') q: string) {
    return this.sites.search(q ?? '');
  }
}
