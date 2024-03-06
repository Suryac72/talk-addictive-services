import { FindAllMessageUseCase } from './use-cases/find-all-message/find-all-message.use-case';
import { SendMessageUseCase } from './use-cases/send-message/send-message.use-case';
import { MessageRequestDTO } from './use-cases/send-message/send-message.dto';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AppResult } from '@suryac72/api-core-services';
import { Request, Response } from 'express';
import { MessageParamsDTO } from './use-cases/find-all-message/find-all-message.dto';

@Controller('messages')
export class MessageController {
  constructor(
    private readonly findAllMessageUseCase: FindAllMessageUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
  ) {}

  @Post('/add')
  async createChat(
    @Body() body: MessageRequestDTO,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const result = await this.sendMessageUseCase.execute({
      body,
      request,
      response,
    });
    if (AppResult.isInvalid(result)) {
      return response.status(400).send(result);
    }
    return response.send(result.getValue());
  }
  @Get('/:chatId')
  async findMessages(
    @Param() params: MessageParamsDTO,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const result = await this.findAllMessageUseCase.execute({
      params,
      request,
      response,
    });
    if (AppResult.isInvalid(result)) {
      return response.status(400).send(result);
    }
    return response.send(result.getValue());
  }
}
