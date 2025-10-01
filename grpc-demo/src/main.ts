import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'hero',
        protoPath: join(__dirname, '../proto/hero.proto'),
        url: 'localhost:5000',
      },
    },
  );
  await app.listen();
  console.log('🚀 gRPC server is running at localhost:5000');
}
bootstrap();
