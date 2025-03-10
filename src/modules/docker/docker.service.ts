import { Injectable } from '@nestjs/common';
import * as Docker from 'dockerode';
import { filterControlCharacters } from 'src/utils/string';
@Injectable()
export class DockerService {
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
  ): Promise<{ output: string; error: string }> {
    const container = await this.docker.createContainer({
      Image: image,
      Cmd: cmd,
      HostConfig: {
        AutoRemove: false, // 执行后自动删除
        Memory: 100 * 1024 * 1024, // 内存限制为 100MB
        NetworkMode: 'none', // 禁用网络
      },
    });

    console.log(container);

    await container.start();
    const containerWaitPromise = container.wait();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        void (async () => {
          try {
            await container.stop();
            await container.remove();
            reject(new Error('Execution Timeout'));
          } catch (err) {
            reject(err);
          }
        })();
      }, timeout);
    });

    try {
      await Promise.race([container.wait(), timeoutPromise]);
      // 检查是否超时
      if (
        Promise.race([containerWaitPromise, timeoutPromise]) === timeoutPromise
      ) {
        throw new Error('Execution Timeout');
      }
      const logs = await container.logs({
        stdout: true,
        stderr: true,
      });

      await container.remove();

      return {
        output: filterControlCharacters(logs.toString().trim()),
        error: '',
      };
    } catch (error) {
      return {
        output: '',
        error: (error as Error).message || 'Unknown Error',
      };
    }
  }
}
