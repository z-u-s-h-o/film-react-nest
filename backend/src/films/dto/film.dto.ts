import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ScheduleItemDto {
  @IsString()
  readonly id: string;

  @IsDateString()
  readonly daytime: string;

  @IsNumber()
  readonly hall: number;

  @IsNumber()
  readonly rows: number;

  @IsNumber()
  readonly seats: number;

  @IsNumber()
  readonly price: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly taken?: string[];
}

export class CreateFilmDto {
  @IsString()
  readonly id: string;

  @IsString()
  readonly title: string;

  @IsOptional()
  @IsString()
  readonly about?: string;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsOptional()
  @IsNumber()
  readonly rating?: number;

  @IsOptional()
  @IsString()
  readonly director?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly tags?: string[];

  @IsOptional()
  @IsString()
  readonly image?: string;

  @IsOptional()
  @IsString()
  readonly cover?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleItemDto)
  readonly schedule?: ScheduleItemDto[];
}
