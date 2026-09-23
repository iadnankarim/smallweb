import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VisitKind = 'page' | 'search';
export type VisitVia =
  'typed' | 'link' | 'back' | 'forward' | 'history' | 'search' | 'reload';

@Schema({ versionKey: false })
export class Visit {
  /** Stable id so a seed re-run can upsert instead of duplicating. */
  @Prop({ type: String, required: true, unique: true, index: true })
  id!: string;

  @Prop({ type: String, required: true, index: true })
  personId!: string;

  @Prop({ type: String, required: true, enum: ['page', 'search'] })
  kind!: VisitKind;

  /** Site address, or the query for kind "search". */
  @Prop({ type: String, required: true })
  address!: string;

  @Prop({ type: String, required: true })
  title!: string;

  @Prop({
    type: String,
    required: true,
    enum: ['typed', 'link', 'back', 'forward', 'history', 'search', 'reload'],
  })
  via!: VisitVia;

  /** False when the address led nowhere. */
  @Prop({ type: Boolean, required: true })
  found!: boolean;

  @Prop({ type: String, required: true })
  at!: string;
}

export type VisitDocument = Visit & Document;
export const VisitSchema = SchemaFactory.createForClass(Visit);
