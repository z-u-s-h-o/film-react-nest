import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Film } from '../films/entities/film.entity';
import { Schedule } from '../films/entities/schedule.entity';

@Injectable()
export class FilmRepository {
  constructor(
    @InjectRepository(Film) private filmRepository: Repository<Film>,
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
      order: {
        schedule: {
          daytime: 'ASC',
        },
      },
    });
  }

  async updateMultipleScheduleItems(
    updates: {
      filmId: string;
      scheduleItemId: string;
      takenSeats: string[];
    }[],
  ): Promise<void> {
    const scheduleIds = updates.map((u) => u.scheduleItemId);
    const schedules = await this.scheduleRepository.find({
      where: { id: In(scheduleIds) },
      relations: ['film'],
    });

    const updatePromises = updates.map(async (update) => {
      const schedule = schedules.find((s) => s.id === update.scheduleItemId);

      if (!schedule) {
        throw new Error(`Сеанс с ID ${update.scheduleItemId} не найден`);
      }

      if (schedule.film.id !== update.filmId) {
        throw new Error(
          `Сеанс ${update.scheduleItemId} не принадлежит фильму ${update.filmId}`,
        );
      }

      const currentTaken = schedule.takenArray;
      const newTaken = [...new Set([...currentTaken, ...update.takenSeats])];

      schedule.takenArray = newTaken;

      await this.scheduleRepository.save(schedule);
    });

    await Promise.all(updatePromises);
  }
}
