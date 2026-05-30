import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/order.dto';
import { FilmRepository } from '../repository/film.repository';
import { v4 as uuidv4 } from 'uuid';
import { Film } from '../films/entities/film.entity';

@Injectable()
export class OrderService {
  constructor(private readonly filmRepository: FilmRepository) {}

  async create(createOrderDto: CreateOrderDto) {
    const { tickets } = createOrderDto;
    const orderResults = [];
    const scheduleUpdates = new Map<
      string,
      { scheduleId: string; seats: string[] }
    >();

    const queryRunner =
      this.filmRepository[
        'scheduleRepository'
      ].manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const ticket of tickets) {
        const row = Number(ticket.row);
        const seat = Number(ticket.seat);
        if (isNaN(row) || isNaN(seat)) {
          throw new BadRequestException(
            `Некорректные номера места: ряд ${ticket.row}, место ${ticket.seat}`,
          );
        }
        const seatKey = `${row}:${seat}`;

        const film = await queryRunner.manager.findOne(Film, {
          where: { id: ticket.film },
          relations: ['schedule'],
        });

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

        const key = `${ticket.film}:${ticket.session}`;
        if (!scheduleUpdates.has(key)) {
          scheduleUpdates.set(key, { scheduleId: ticket.session, seats: [] });
        }
        scheduleUpdates.get(key).seats.push(seatKey);

        orderResults.push({
          film: ticket.film,
          session: ticket.session,
          daytime: ticket.daytime,
          row,
          seat,
          price: ticket.price,
          id: uuidv4(),
        });
      }

      const updatePromises = Array.from(scheduleUpdates.values()).map(
        ({ scheduleId, seats }) =>
          this.filmRepository.updateTakenSeats(scheduleId, seats, queryRunner),
      );

      await Promise.all(updatePromises);

      await queryRunner.commitTransaction();

      return {
        total: orderResults.length,
        items: orderResults,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
