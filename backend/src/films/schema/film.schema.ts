import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type FilmDocument = Film & Document;

@Schema({ _id: false })
export class ScheduleItem {
  @Prop({
    required: true,
    default: () => uuidv4(),
    unique: true,
  })
  id: string;

  @Prop({ required: true, type: Date })
  daytime: Date;

  @Prop({ required: true })
  hall: number;

  @Prop({ required: true })
  rows: number;

  @Prop({ required: true })
  seats: number;

  @Prop({ required: true })
  price: number;

  @Prop({ default: [] })
  taken: string[];
}

@Schema()
export class Film {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  about: string;

  @Prop()
  description: string;

  @Prop()
  rating: number;

  @Prop()
  director: string;

  @Prop([String])
  tags: string[];

  @Prop()
  image: string;

  @Prop()
  cover: string;

  @Prop([ScheduleItem])
  schedule: ScheduleItem[];
}

export const FilmSchema = SchemaFactory.createForClass(Film);
