import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FilmRepository } from '../repository/film.repository';
import { Film, ScheduleItem } from './schema/film.schema';

@Injectable()
export class FilmsService {
  constructor(private readonly filmRepository: FilmRepository) {}

  async findAll(): Promise<Film[]> {
    try {
      return await this.filmRepository.findAll();
    } catch (error) {
      throw new InternalServerErrorException(
        'Не удалось загрузить список фильмов',
      );
    }
  }

  async getSchedule(filmId: string): Promise<ScheduleItem[]> {
    try {
      const film = await this.filmRepository.findById(filmId);

      if (!film) {
        throw new NotFoundException(`Фильм с ID ${filmId} не найден`);
      }

      return film.schedule || [];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Ошибка при получении расписания сеансов',
      );
    }
  }
}
