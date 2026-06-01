import { Injectable, ConflictException } from '@nestjs/common';
import { Repository, QueryRunner } from 'typeorm';
import { Film } from '../films/entities/film.entity';
import { Schedule } from '../films/entities/schedule.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FilmRepository {
  constructor(
    @InjectRepository(Film)
    private filmRepository: Repository<Film>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
  ) {}

  async findAll(): Promise<Film[]> {
    return await this.filmRepository.find();
  }

  async findById(id: string): Promise<Film | null> {
    return await this.filmRepository.findOne({
      where: { id },
      relations: ['schedule'],
      order: { schedule: { daytime: 'ASC' } },
    });
  }

  async updateTakenSeats(
    scheduleId: string,
    seatKeys: string[],
    queryRunner: QueryRunner,
  ): Promise<void> {
    const manager = queryRunner.manager;

    const schedule = await manager
      .createQueryBuilder(Schedule, 'schedule')
      .setLock('pessimistic_write')
      .where('schedule.id = :id', { id: scheduleId })
      .getOne();

    if (!schedule) {
      throw new ConflictException(
        `Сеанс ${scheduleId} не найден при обновлении`,
      );
    }

    const existingTaken = schedule.taken || [];
    const duplicates = seatKeys.filter((seat) => existingTaken.includes(seat));
    if (duplicates.length > 0) {
      throw new ConflictException(`Места уже заняты: ${duplicates.join(', ')}`);
    }

    const newTaken = [...existingTaken, ...seatKeys];
    const result = await manager
      .createQueryBuilder()
      .update(Schedule)
      .set({ taken: newTaken })
      .where('id = :id', { id: scheduleId })
      .execute();

    if (result.affected === 0) {
      throw new ConflictException(`Не удалось обновить сеанс ${scheduleId}`);
    }
  }
}
