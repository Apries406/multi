import { NestFactory } from '@nestjs/core';
import { OjModule } from './oj.module';

async function bootstrap() {
  const app = await NestFactory.create(OjModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
