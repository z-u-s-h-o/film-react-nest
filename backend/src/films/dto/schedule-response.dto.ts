export class ScheduleResponseDto {
  readonly id: string;
  readonly film: string;
  readonly daytime: string;
  readonly day: string;
  readonly time: string;
  readonly hall: number;
  readonly rows: number;
  readonly seats: number;
  readonly price: number;
  readonly taken: string[];
}
