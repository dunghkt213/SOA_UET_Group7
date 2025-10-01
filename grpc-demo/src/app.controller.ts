import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('HeroService', 'FindOne')
  findOne(data: { id: number }) {
    return this.appService.findOne(data);
  }
}
