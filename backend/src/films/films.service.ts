import { Injectable } from '@nestjs/common';
import { FilmRepository } from '../repository/film.repository';
import { Film, ScheduleItem } from './schema/film.schema';

@Injectable()
export class FilmsService {
  constructor(private readonly filmRepository: FilmRepository) {}

  async findAll(): Promise<Film[]> {
    try {
      return await this.filmRepository.findAll();
    } catch (error) {
      throw error;
    }
  }

  async getSchedule(filmId: string): Promise<ScheduleItem[]> {
    const film = await this.filmRepository.findById(filmId);
    return film?.schedule || [];
  }
}
