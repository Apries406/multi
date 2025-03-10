import { Injectable } from '@nestjs/common';
import { DockerService } from '../docker/docker.service';

@Injectable()
export class ExecuteService {
  constructor(private dockerService: DockerService) {}

  executeCode(code: string, language: string) {
    const config = this.getLanguageConfig(code, language);
    return this.dockerService.runContainer(
      config.image,
      config.cmd,
      config.timeout,
    );
  }
  private getLanguageConfig(code: string, language: string) {
    const baseConfig = {
      timeout: 1000, //默认 1s 超时
    };
    console.log(language);
    switch (language.toLowerCase()) {
      case 'python':
        return {
          ...baseConfig,
          image: 'python:latest',
          cmd: ['python', '-c', code],
        };

      case 'javascript':
        return {
          ...baseConfig,
          image: 'node:slim',
          cmd: ['node', '-e', code],
        };

      case 'c':
        return {
          ...baseConfig,
          image: 'gcc:latest',
          cmd: [
            'sh',
            '-c',
            `echo "${code}" > main.c && gcc main.c -o main && ./main`,
          ],
        };

      case 'c++':
        return {
          ...baseConfig,
          image: 'gcc:latest',
          cmd: [
            'sh',
            '-c',
            `echo "${code}" > main.cpp && g++ main.cpp -o main && ./main`,
          ],
        };

      case 'java':
        return {
          ...baseConfig,
          image: 'openjdk:25-jdk',
          cmd: [
            'sh',
            '-c',
            `echo "${code}" > Main.java && javac Main.java && java Main`,
          ],
        };

      case 'rust':
        return {
          ...baseConfig,
          image: 'rust:latest',
          cmd: [
            'sh',
            '-c',
            `echo "${code}" > main.rs && rustc main.rs && ./main`,
          ],
        };

      default:
        throw new Error('Unsupported Language!');
    }
  }
}
