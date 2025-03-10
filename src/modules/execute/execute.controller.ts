import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ExecuteService } from './execute.service';
import { ExecuteCodeDto } from './dto/execute-code.dto';

@Controller('execute')
export class ExecuteController {
  constructor(private readonly executeService: ExecuteService) {}

  @Post('/')
  @HttpCode(200)
  executeCode(@Body() dto: ExecuteCodeDto) {
    return this.executeService.executeCode(dto.code, dto.language);
  }
}
