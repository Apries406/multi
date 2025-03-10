import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DockerModule } from './modules/docker/docker.module';
import { ExecuteModule } from './modules/execute/execute.module';

@Module({
  imports: [DockerModule, ExecuteModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
