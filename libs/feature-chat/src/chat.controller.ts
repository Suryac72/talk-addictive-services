import { Body, Controller, Get, Param, Patch, Post, Req, Res } from '@nestjs/common';
import { AppResult } from '@suryac72/api-core-services';
import { Request, Response } from 'express';
import { ChatParams } from './use-cases/find-one-chat/find-one-chat.dto';
import { FindOneChatUseCase } from './use-cases/find-one-chat/find-one-chat.use-case';
import { ChatDTO } from './dtos/chat.dto';
import { SaveChatUseCase } from './use-cases/save-chat/save-chat.use-case';
import { CreateGroupChatUseCase } from './use-cases/create-group-chat/create-group-chat.use-case';
import { GroupChatRequestBody } from './use-cases/create-group-chat/create-group-chat.dto';
import { RenameGroupChatUseCase } from './use-cases/rename-group-chat/rename-group-chat.use-case';
import { RemoveUserFromGroupUseCase } from './use-cases/remove-from-group-chat/remove-from-group-chat.use-case';
import { RenameGroupRequestDTO } from './use-cases/rename-group-chat/rename-group-chat.dto';
import { GroupChatRequestBodyDTO } from './use-cases/add-to-group-chat/add-to-group-chat.dto';
import { AddToGroupChatUseCase } from './use-cases/add-to-group-chat/add-to-group-chat.use-case';
@Controller('chats')
export class ChatController {
  constructor(
    private readonly findOneChatUseCase: FindOneChatUseCase,
    private readonly saveChatUseCase: SaveChatUseCase,
    private readonly createGroupUseCase:CreateGroupChatUseCase,
    private readonly renameGroupUseCase:RenameGroupChatUseCase,
    private readonly removeFromGroupUseCase: RemoveUserFromGroupUseCase,
    private readonly addToGroupUseCase: AddToGroupChatUseCase,

  ) {}

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

  @Post('/group')
  async createGroup(
    @Body() body: GroupChatRequestBody,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const result = await this.createGroupUseCase.execute({
      body,
      request,
      response,
    });
    if (AppResult.isInvalid(result)) {
      return response.status(400).send(result);
    }
    return response.send(result.getValue());
  }

  @Patch('/rename')
  async renameGroup(
    @Body() body: RenameGroupRequestDTO,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const result = await this.renameGroupUseCase.execute({
      body,
      request,
      response,
    });
    if (AppResult.isInvalid(result)) {
      return response.status(400).send(result);
    }
    return response.send(result.getValue());
  }

  @Patch('/removeGroup')
  async removeGroup(
    @Body() body:GroupChatRequestBodyDTO ,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const result = await this.removeFromGroupUseCase.execute({
      body,
      request,
      response,
    });
    if (AppResult.isInvalid(result)) {
      return response.status(400).send(result);
    }
    return response.send(result.getValue());
  }

  @Patch('/addToGroup')
  async addToGroup(
    @Body() body:GroupChatRequestBodyDTO ,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const result = await this.addToGroupUseCase.execute({
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
