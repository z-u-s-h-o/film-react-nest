import { Controller, Post, Body } from '@nestjs/common';
import { CreateOrderDto } from './dto/order.dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    try {
      const result = await this.orderService.create(createOrderDto);
      return result;
    } catch (error) {
      throw error;
    }
  }
}
