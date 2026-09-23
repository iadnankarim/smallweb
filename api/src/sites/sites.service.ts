import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PeopleService } from '../people/people.service';
import { Person } from '../people/person.schema';
import { searchSites, SearchResultDto } from '../common/search';
import { sanitizeAuthorHtml } from '../common/sanitize';
import { CreateSiteDto } from './dto/create-site.dto';
import { Site, SiteDocument } from './site.schema';

export interface SiteSummaryDto {
  address: string;
  title: string;
  author: Person;
}

export interface SiteDto extends SiteSummaryDto {
  html: string;
  createdAt: string;
}

const UNKNOWN_AUTHOR: Person = { id: 'unknown', name: 'Unknown' };

@Injectable()
export class SitesService {
  constructor(
    @InjectModel(Site.name) private readonly model: Model<SiteDocument>,
    private readonly people: PeopleService,
  ) {}

  async listSummaries(): Promise<SiteSummaryDto[]> {
    const [sites, byId] = await Promise.all([
      this.model.find().sort({ title: 1 }).lean(),
      this.people.findAllById(),
    ]);
    return sites.map((s) => ({
      address: s.address,
      title: s.title,
      author: byId.get(s.authorId) ?? UNKNOWN_AUTHOR,
    }));
  }

  async getByAddress(address: string): Promise<SiteDto | null> {
    const site = await this.model.findOne({ address }).lean();
    if (!site) return null;
    const author =
      (await this.people.findById(site.authorId)) ?? UNKNOWN_AUTHOR;
    return {
      address: site.address,
      title: site.title,
      author,
      html: site.html,
      createdAt: site.createdAt,
    };
  }

  async create(dto: CreateSiteDto): Promise<SiteDto> {
    const existing = await this.model.exists({ address: dto.address });
    if (existing)
      throw new ConflictException(`${dto.address} is already taken.`);

    const html = sanitizeAuthorHtml(dto.html);
    const createdAt = new Date().toISOString();
    await this.model.create({
      address: dto.address,
      title: dto.title,
      authorId: dto.authorId,
      html,
      createdAt,
    });

    const author = (await this.people.findById(dto.authorId)) ?? UNKNOWN_AUTHOR;
    return { address: dto.address, title: dto.title, author, html, createdAt };
  }

  async search(query: string): Promise<SearchResultDto[]> {
    const [sites, byId] = await Promise.all([
      this.model.find().lean(),
      this.people.findAllById(),
    ]);
    const searchable = sites.map((s) => ({
      address: s.address,
      title: s.title,
      html: s.html,
      author: byId.get(s.authorId) ?? UNKNOWN_AUTHOR,
    }));
    return searchSites(searchable, query);
  }

  /** Seed-only: upsert by address so re-running the seed never doubles the web. */
  async upsert(site: {
    address: string;
    title: string;
    authorId: string;
    html: string;
    createdAt: string;
  }): Promise<void> {
    await this.model.updateOne(
      { address: site.address },
      { $set: site },
      { upsert: true },
    );
  }
}
