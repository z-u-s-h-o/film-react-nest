import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/order.dto';

jest.mock('uuid', () => ({
  v4: () => 'mock-uuid-123',
}));

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  const mockOrderService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  describe('create', () => {
    it('should create an order and return the result', async () => {
      const createOrderDto: CreateOrderDto = {
        email: 'test@example.com',
        phone: '+79991234567',
        tickets: [
          {
            film: '1',
            session: 's1',
            daytime: '2026-06-14T16:43:30.000Z',
            day: '14 июня',
            time: '19:00',
            row: 5,
            seat: 10,
            price: 300,
          },
        ],
      };

      const mockResult = {
        total: 1,
        items: [
          {
            film: '1',
            session: 's1',
            daytime: '2026-06-14T16:43:30.000Z',
            day: '14 июня',
            time: '19:00',
            row: 5,
            seat: 10,
            price: 300,
            id: 'uuid-123',
          },
        ],
      };

      mockOrderService.create.mockResolvedValue(mockResult);

      const result = await controller.create(createOrderDto);

      expect(result).toEqual(mockResult);
      expect(service.create).toHaveBeenCalledWith(createOrderDto);
    });

    it('should handle empty tickets array', async () => {
      const dtoWithEmptyTickets: CreateOrderDto = {
        email: 'test@example.com',
        phone: '+79991234567',
        tickets: [],
      };

      mockOrderService.create.mockResolvedValue({ total: 0, items: [] });

      const result = await controller.create(dtoWithEmptyTickets);

      expect(result).toEqual({ total: 0, items: [] });
      expect(service.create).toHaveBeenCalledWith(dtoWithEmptyTickets);
    });

    it('should throw an error if the service throws', async () => {
      const createOrderDto: CreateOrderDto = {
        email: 'test@example.com',
        phone: '+79991234567',
        tickets: [
          {
            film: '1',
            session: 's1',
            daytime: '2026-06-14T16:43:30.000Z',
            day: '14 июня',
            time: '19:00',
            row: 5,
            seat: 10,
            price: 300,
          },
        ],
      };

      const serviceError = new Error('Service error');
      mockOrderService.create.mockRejectedValue(serviceError);

      await expect(controller.create(createOrderDto)).rejects.toThrow(
        serviceError,
      );
    });

    it('should call service.create exactly once per request', async () => {
      mockOrderService.create.mockClear();
      const createOrderDto: CreateOrderDto = {
        email: 'test@example.com',
        phone: '+79991234567',
        tickets: [
          {
            film: '1',
            session: 's1',
            daytime: '2026-06-14T16:43:30.000Z',
            day: '14 июня',
            time: '19:00',
            row: 5,
            seat: 10,
            price: 300,
          },
        ],
      };

      mockOrderService.create.mockResolvedValue({ total: 1, items: [] });

      await controller.create(createOrderDto);
      await controller.create(createOrderDto);

      expect(service.create).toHaveBeenCalledTimes(2);
    });
  });
});
