import { Controller, Get, Param } from '@nestjs/common';
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

    return {
      total: schedule.length,
      items: schedule,
    };
  }
}
