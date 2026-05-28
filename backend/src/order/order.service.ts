import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/order.dto';
import { FilmRepository } from '../repository/film.repository';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrderService {
  constructor(private readonly filmRepository: FilmRepository) {}

  async create(createOrderDto: CreateOrderDto) {
    const { tickets } = createOrderDto;
    const orderResults = [];
    const scheduleUpdates = new Map<string, { seats: string[] }>();

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
          scheduleUpdates.set(key, { seats: [] });
        }
        scheduleUpdates.get(key).seats.push(seatKey);

        orderResults.push({
          film: ticket.film,
          session: ticket.session,
          daytime: ticket.daytime,
          row: ticket.row,
          seat: ticket.seat,
          price: ticket.price,
          id: uuidv4(),
        });
      }

      const updates = Array.from(scheduleUpdates.entries()).map(
        ([key, value]) => {
          const [filmId, scheduleItemId] = key.split(':');
          return {
            filmId,
            scheduleItemId,
            takenSeats: value.seats,
          };
        },
      );

      await this.filmRepository.updateMultipleScheduleItems(updates);

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
      }
      throw new InternalServerErrorException(
        'Произошла ошибка при оформлении заказа',
      );
    }
  }
}
