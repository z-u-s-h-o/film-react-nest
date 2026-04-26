import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  ArrayMinSize,
  IsEmail,
  Matches,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TicketDto {
  @IsString()
  readonly film: string;

  @IsString()
  readonly session: string;

  @IsDateString()
  readonly daytime: string;

  @IsString()
  readonly day: string;

  @IsString()
  readonly time: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  readonly row: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  readonly seat: number;

  @IsNumber()
  readonly price: number;
}

export class CreateOrderDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/)
  readonly phone: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketDto)
  @IsNotEmpty()
  @ArrayMinSize(1)
  readonly tickets: TicketDto[];
}
