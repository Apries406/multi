import { NestFactory } from '@nestjs/core';
import { LectechModule } from './lectech.module';

async function bootstrap() {
  const app = await NestFactory.create(LectechModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
