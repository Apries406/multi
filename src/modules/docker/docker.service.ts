import { Injectable, Logger } from '@nestjs/common';
import * as Docker from 'dockerode';
import { formatExportLogs } from 'src/utils/string';
import {
  LanguageConfig,
  LanguageConfigClass,
  languageConfigMap,
  SupportedLanguages,
} from './language.config';
@Injectable()
export class DockerService {
  private readonly logger: Logger = new Logger('DockerService');
  private readonly docker: Docker;

  constructor() {
    this.docker = new Docker({
      protocol: 'http',
      host: '127.0.0.1',
      port: 2375,
    });
  }

  async runContainer(
    image: string,
    cmd: string[],
    timeout: number,
  ): Promise<{ output: string; error: string; executeTime?: number }> {
    // 检查镜像是否存在
    const images = await this.docker.listImages();
    const imageExists = images.some((img) => img.RepoTags?.includes(image));

    if (!imageExists) {
      return {
        output: '',
        error: 'Docker image not found',
      };
    }

    const container = await this.docker.createContainer({
      Image: image,
      Cmd: cmd,
      HostConfig: {
        AutoRemove: false, // 执行后自动删除
        Memory: 100 * 1024 * 1024, // 内存限制为 100MB
        NetworkMode: 'none', // 禁用网络
      },
    });

    await container.start();

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        void (() => {
          reject(new Error('Execution Timeout'));
        })();
      }, timeout);
    });

    try {
      await Promise.race([container.wait(), timeoutPromise]);

      const logs = await container.logs({
        stdout: true,
        stderr: true,
      });

      await container.remove();

      return {
        ...formatExportLogs(logs.toString()),
        error: '',
      };
    } catch (error) {
      return {
        output: '',
        error: (error as Error).message || 'Unknown Error',
      };
    } finally {
      try {
        await container.stop();
      } catch (err) {
        this.logger.error(err);
      }
      try {
        await container.remove();
      } catch (err) {
        this.logger.error(err);
      }
    }
  }

  getLanguageConfig(code: string, language: string): LanguageConfig {
    if (!(language in SupportedLanguages)) {
      throw new TypeError('Unsupported language');
    }

    const ConfigClass = languageConfigMap[language] as LanguageConfigClass; //获取类
    const configInstance = new ConfigClass(code);

    return configInstance.getConfig();
  }
}
