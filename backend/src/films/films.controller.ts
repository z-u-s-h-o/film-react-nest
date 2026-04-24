import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { FilmsService } from './films.service';

@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  async findAll() {
    const films = await this.filmsService.findAll();

    return {
      total: films.length,
      items: films.map((film) => ({
        id: film.id,
        title: film.title,
        about: film.about,
        description: film.description,
        rating: film.rating,
        director: film.director,
        tags: film.tags || [],
        image: film.image,
        cover: film.cover,
      })),
    };
  }

  @Get(':id/schedule')
  async getSchedule(@Param('id') id: string) {
    const schedule = await this.filmsService.getSchedule(id);
    if (!schedule) {
      throw new NotFoundException(
        `Расписание для фильма с ID ${id} не найдено`,
      );
    }

    return {
      total: schedule.length,
      items: schedule.map((item) => ({
        id: item.id,
        film: id,
        daytime: item.daytime.toISOString(),
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
        taken: item.taken || [],
      })),
    };
  }
}
