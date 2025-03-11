import { Injectable } from '@nestjs/common';
import { DockerService } from '../docker/docker.service';

@Injectable()
export class ExecuteService {
  constructor(private dockerService: DockerService) {}

  executeCode(code: string, language: string) {
    const config = this.dockerService.getLanguageConfig(code, language);
    return this.dockerService.runContainer(
      config.image,
      config.cmd,
      config.timeout,
    );
  }
}
