import { Injectable } from '@nestjs/common';

@Injectable()
export class LectechService {
  getHello(): string {
    return 'Hello World!';
  }
}
