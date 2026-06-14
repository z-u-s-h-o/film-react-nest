import { Test, TestingModule } from '@nestjs/testing';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';

describe('FilmsController', () => {
  let controller: FilmsController;
  let service: FilmsService;

  const mockFilmsService = {
    findAll: jest.fn(),
    getSchedule: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [
        {
          provide: FilmsService,
          useValue: mockFilmsService,
        },
      ],
    }).compile();

    controller = module.get<FilmsController>(FilmsController);
    service = module.get<FilmsService>(FilmsService);
  });

  describe('findAll', () => {
    it('should return a list of movies with general information', async () => {
      const mockFilms = [
        {
          id: '1',
          title: 'Фильм 1',
          about: 'Описание 1',
          description: 'Полное описание 1',
          rating: 8.5,
          director: 'Режиссёр 1',
          tags: ['драма'],
          image: 'image1.jpg',
          cover: 'cover1.jpg',
        },
      ];

      mockFilmsService.findAll.mockResolvedValue(mockFilms);

      const result = await controller.findAll();

      expect(result).toEqual({
        total: 1,
        items: mockFilms,
      });
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return empty list when no films found', async () => {
      mockFilmsService.findAll.mockResolvedValue([]);
      const result = await controller.findAll();
      expect(result).toEqual({
        total: 0,
        items: [],
      });
    });

    it('should handle service error when fetching films', async () => {
      const error = new Error('Database error');
      mockFilmsService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrowError(error);
    });
  });

  describe('getSchedule', () => {
    it('should to return the session schedule for the movie', async () => {
      const filmId = '1';
      const mockSchedule = [
        {
          id: 's1',
          film: filmId,
          daytime: new Date(),
          day: '1 января',
          time: '19:00',
          hall: 'Зал 1',
          rows: 10,
          seats: 100,
          price: 300,
          taken: ['1:5', '2:3'],
        },
      ];

      mockFilmsService.getSchedule.mockResolvedValue(mockSchedule);

      const result = await controller.getSchedule(filmId);

      expect(result).toEqual({
        total: 1,
        items: mockSchedule,
      });
      expect(service.getSchedule).toHaveBeenCalledWith(filmId);
    });

    it('should return empty schedule when no sessions available', async () => {
      const filmId = '1';
      mockFilmsService.getSchedule.mockResolvedValue([]);

      const result = await controller.getSchedule(filmId);

      expect(result).toEqual({
        total: 0,
        items: [],
      });
    });

    it('should handle missing required fields in schedule items', async () => {
      const filmId = '1';
      const incompleteSchedule = [
        {
          id: 's1',
          film: filmId,
          day: 'Не указано',
          time: 'Не указано',
          hall: 1,
          rows: 10,
          seats: 100,
          price: 300,
        },
      ];
      mockFilmsService.getSchedule.mockResolvedValue(incompleteSchedule);

      const result = await controller.getSchedule(filmId);

      expect(result.items[0]).toHaveProperty('day', 'Не указано');
      expect(result.items[0]).toHaveProperty('time', 'Не указано');
      expect(result.items[0]).not.toHaveProperty('taken');
      expect(result.items[0]).not.toHaveProperty('daytime');
    });

    it('should handle service error when fetching schedule', async () => {
      const filmId = '1';
      const error = new Error('Schedule service error');
      mockFilmsService.getSchedule.mockRejectedValue(error);

      await expect(controller.getSchedule(filmId)).rejects.toBeInstanceOf(
        Error,
      );
    });
  });
});
