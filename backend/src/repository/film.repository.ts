import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Film, FilmDocument } from '../films/schema/film.schema';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class FilmRepository {
  constructor(@InjectModel(Film.name) private filmModel: Model<FilmDocument>) {}

  async findAll(): Promise<Film[]> {
    try {
      return await this.filmModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException(
        'Не удалось загрузить список фильмов',
      );
    }
  }

  async findById(id: string): Promise<Film | null> {
    try {
      return await this.filmModel.findOne({ id }).exec();
    } catch (error) {
      throw new InternalServerErrorException('Ошибка при поиске фильма');
    }
  }

  async updateScheduleItem(
    filmId: string,
    scheduleItemId: string,
    takenSeats: string[],
  ): Promise<Film> {
    try {
      const updatedFilm = await this.filmModel
        .findOneAndUpdate(
          { id: filmId, 'schedule.id': scheduleItemId },
          { 'schedule.$.taken': takenSeats },
          { new: true },
        )
        .exec();

      if (!updatedFilm) {
        throw new NotFoundException(`Фильм или сеанс не найден при обновлении`);
      }

      return updatedFilm;
    } catch (error) {
      throw error;
    }
  }
}
