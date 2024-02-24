import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApiResponse, AppError, AppResult } from '@suryac72/api-core-services';
import { chats } from './data/data';
import {Request,Response} from 'express'
@Controller('chats')
export class ChatController {
  constructor() {}
  @Get('/all')
  chats(@Req() req: Request, @Res() res : Response) {
    console.log(chats);
    return res.send(chats);
  }
}
