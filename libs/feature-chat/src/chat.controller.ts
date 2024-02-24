import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { ApiResponse, AppError, AppResult } from '@suryac72/api-core-services';
import { chats } from './data/data';
import {Request,Response} from 'express'
import { FindAllChatUseCase } from './use-cases/find-all-chats/find-all-chats.use-case';
import { ChatParams } from './use-cases/find-one-chat/find-one-chat.dto';
import { FindOneChatUseCase } from './use-cases/find-one-chat/find-one-chat.use-case';
@Controller('chats')
export class ChatController {
  constructor(private readonly findAllChatUseCase:FindAllChatUseCase,private readonly findOneChatUseCase:FindOneChatUseCase) {}
  @Get('/all')
  async chats(@Req() req: Request, @Res() res : Response) {
    const result = await this.findAllChatUseCase.execute({request:req,response:res});
    if(AppResult.isInvalid(result)){
      return result;
    }
    return res.send(result.getValue());
  }

  @Get('/:id')
  async findOneChat(@Param() params: ChatParams,@Res() response: Response) {
    const result = await this.findOneChatUseCase.execute({params});
    if(AppResult.isInvalid(result)){
      return result;
    }
    return response.send(result.getValue());
  }
}
