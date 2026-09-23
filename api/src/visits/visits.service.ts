import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'node:crypto';
import { Model } from 'mongoose';
import { CreateVisitDto } from './dto/create-visit.dto';
import { Visit, VisitDocument } from './visit.schema';

@Injectable()
export class VisitsService {
  constructor(
    @InjectModel(Visit.name) private readonly model: Model<VisitDocument>,
  ) {}

  listByPerson(personId: string): Promise<Visit[]> {
    return this.model
      .find({ personId })
      .select({
        _id: 0,
        id: 1,
        personId: 1,
        kind: 1,
        address: 1,
        title: 1,
        via: 1,
        found: 1,
        at: 1,
      })
      .sort({ at: -1 })
      .lean();
  }

  async record(dto: CreateVisitDto): Promise<Visit> {
    const visit: Visit = {
      id: randomUUID(),
      at: new Date().toISOString(),
      ...dto,
    };
    await this.model.create(visit);
    return visit;
  }

  /** Seed-only: upsert by id so re-running the seed never doubles the history. */
  async upsert(visit: Visit): Promise<void> {
    await this.model.updateOne(
      { id: visit.id },
      { $set: visit },
      { upsert: true },
    );
  }
}
