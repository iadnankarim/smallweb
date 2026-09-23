import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ versionKey: false })
export class Site {
  @Prop({ type: String, required: true, unique: true, index: true })
  address!: string;

  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: String, required: true })
  authorId!: string;

  /** Already sanitized on publish, and re-sanitized server-side regardless. */
  @Prop({ type: String, required: true })
  html!: string;

  @Prop({ type: String, required: true })
  createdAt!: string;
}

export type SiteDocument = Site & Document;
export const SiteSchema = SchemaFactory.createForClass(Site);
