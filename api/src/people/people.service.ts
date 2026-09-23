import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Person, PersonDocument } from './person.schema';

@Injectable()
export class PeopleService {
  constructor(
    @InjectModel(Person.name) private readonly model: Model<PersonDocument>,
  ) {}

  findAll(): Promise<Person[]> {
    return this.model
      .find()
      .select({ _id: 0, id: 1, name: 1 })
      .sort({ name: 1 })
      .lean();
  }

  findById(id: string): Promise<Person | null> {
    return this.model.findOne({ id }).select({ _id: 0, id: 1, name: 1 }).lean();
  }

  /** id -> Person, for joining sites/visits without N+1 queries. */
  async findAllById(): Promise<Map<string, Person>> {
    const people = await this.findAll();
    return new Map(people.map((p) => [p.id, p]));
  }

  async upsert(person: Person): Promise<void> {
    await this.model.updateOne(
      { id: person.id },
      { $set: person },
      { upsert: true },
    );
  }
}
