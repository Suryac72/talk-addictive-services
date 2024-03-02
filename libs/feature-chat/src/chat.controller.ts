import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { AppResult } from '@suryac72/api-core-services';
import { Request, Response } from 'express';
import { ChatParams } from './use-cases/find-one-chat/find-one-chat.dto';
import { FindOneChatUseCase } from './use-cases/find-one-chat/find-one-chat.use-case';
import { ChatDTO } from './dtos/chat.dto';
import { SaveChatUseCase } from './use-cases/save-chat/save-chat.use-case';
@Controller('chats')
export class ChatController {
  constructor(
    private readonly findOneChatUseCase: FindOneChatUseCase,
    private readonly saveChatUseCase: SaveChatUseCase,
  ) {}

  @Get('/healthCheck')
  async healthCheck() {
    return 'Hello Chats...';
  }

  @Get('/:userId')
  async findOneChat(
    @Param() params: ChatParams,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const result = await this.findOneChatUseCase.execute({
      params,
      request,
      response,
    });
    if (AppResult.isInvalid(result)) {
      return response.status(400).send(result);
    }
    return response.send(result.getValue());
  }

  @Post('/add')
  async createChat(
    @Body() body: ChatDTO,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const result = await this.saveChatUseCase.execute({
      body,
      request,
      response,
    });
    if (AppResult.isInvalid(result)) {
      return response.status(400).send(result);
    }
    return response.send(result.getValue());
  }
}
