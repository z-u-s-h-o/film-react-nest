import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FilmRepository } from '../repository/film.repository';
import { Film } from '../films/entities/film.entity';

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

  async getSchedule(filmId: string): Promise<any[]> {
    const film = await this.filmRepository.findById(filmId);
    if (!film) {
      throw new NotFoundException(`Фильм с ID ${filmId} не найден`);
    }

    return film.schedule.map((item) => ({
      id: item.id,
      film: filmId,
      daytime: item.daytime,
      day: item.daytime
        ? new Date(item.daytime).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
          })
        : 'Не указано',
      time: item.daytime
        ? new Date(item.daytime).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Не указано',
      hall: item.hall,
      rows: item.rows,
      seats: item.seats,
      price: item.price,
      taken: item.takenArray,
    }));
  }
}
