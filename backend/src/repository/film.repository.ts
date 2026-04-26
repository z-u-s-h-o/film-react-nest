import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Film, FilmDocument } from '../films/schema/film.schema';

@Injectable()
export class FilmRepository {
  constructor(@InjectModel(Film.name) private filmModel: Model<FilmDocument>) {}

  async findAll(): Promise<Film[]> {
    return await this.filmModel.find().exec();
  }

  async findById(id: string): Promise<Film | null> {
    return await this.filmModel.findOne({ id }).exec();
  }

  async updateScheduleItem(
    filmId: string,
    scheduleItemId: string,
    takenSeats: string[],
  ): Promise<Film> {
    return await this.filmModel
      .findOneAndUpdate(
        { id: filmId, 'schedule.id': scheduleItemId },
        { 'schedule.$.taken': takenSeats },
        { new: true },
      )
      .exec();
  }

  async updateMultipleScheduleItems(
    updates: {
      filmId: string;
      scheduleItemId: string;
      takenSeats: string[];
    }[],
  ): Promise<Film[]> {
    const updatePromises = updates.map((update) =>
      this.updateScheduleItem(
        update.filmId,
        update.scheduleItemId,
        update.takenSeats,
      ),
    );

    return await Promise.all(updatePromises);
  }
}
