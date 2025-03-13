import { Injectable } from '@nestjs/common';

@Injectable()
export class OjService {
  getHello(): string {
    return 'Hello World!';
  }
}
