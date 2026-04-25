import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/order.dto';
import { FilmRepository } from '../repository/film.repository';
import { v4 as uuidv4 } from 'uuid';
import { Film } from 'src/films/schema/film.schema';

@Injectable()
export class OrderService {
  constructor(private readonly filmRepository: FilmRepository) {}

  async create(createOrderDto: CreateOrderDto) {
    const { tickets } = createOrderDto;
    const orderResults = [];
    const scheduleUpdates = new Map<
      string,
      { scheduleId: string; seats: string[]; film: Film }
    >();

    try {
      for (const ticket of tickets) {
        const film = await this.filmRepository.findById(ticket.film);
        if (!film) {
          throw new NotFoundException(`Фильм ${ticket.film} не найден`);
        }

        const scheduleItem = film.schedule.find(
          (item) => item.id === ticket.session,
        );
        if (!scheduleItem) {
          throw new NotFoundException(
            `Сеанс ${ticket.session} не найден для фильма ${ticket.film}`,
          );
        }

        const seatKey = `${ticket.row}:${ticket.seat}`;

        if (scheduleItem.taken.includes(seatKey)) {
          throw new ConflictException(
            `Кресло ${seatKey} уже занято для сеанса ${ticket.session}`,
          );
        }

        const key = `${ticket.film}:${ticket.session}`;
        if (!scheduleUpdates.has(key)) {
          scheduleUpdates.set(key, {
            scheduleId: ticket.session,
            seats: [],
            film: film,
          });
        }
        scheduleUpdates.get(key).seats.push(seatKey);

        const orderId = uuidv4();
        orderResults.push({
          film: ticket.film,
          session: ticket.session,
          daytime: ticket.daytime,
          row: ticket.row,
          seat: ticket.seat,
          price: ticket.price,
          id: orderId,
        });
      }

      const filmScheduleUpdates = [];
      for (const [key, updateData] of scheduleUpdates) {
        const [filmId] = key.split(':');
        const existingTakenSeats =
          updateData.film.schedule.find(
            (item) => item.id === updateData.scheduleId,
          )?.taken || [];

        filmScheduleUpdates.push({
          filmId,
          scheduleItemId: updateData.scheduleId,
          takenSeats: [...existingTakenSeats, ...updateData.seats],
        });
      }

      await this.filmRepository.updateMultipleScheduleItems(
        filmScheduleUpdates,
      );

      return {
        total: orderResults.length,
        items: orderResults,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      } else if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Произошла ошибка при оформлении заказа',
        );
      }
    }
  }
}
