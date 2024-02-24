import { Injectable } from '@nestjs/common';
import { ApiResponse, AppError, AppResult, DomainService, UseCase } from '@suryac72/api-core-services';
import { Request,Response } from 'express';
import { ChatDTO } from '@app/feature-chat/dtos/chat.dto';
import { chats } from '@app/feature-chat/data/data';


type RequestBody = {
  request: Request,
  response: Response
};

type ResponseBody =
  | AppResult<AppError>
  |AppResult<ApiResponse<ChatDTO[], unknown>>

@Injectable()
export class FindAllChatUseCase implements UseCase<RequestBody, ResponseBody> {
  constructor(
    // private chatRepository: ChatRepository,
    private readonly domainService: DomainService,
  ) {}

  async execute(requestObj: RequestBody): Promise<ResponseBody> {
    try {
      const { request,response } = requestObj;
      return AppResult.ok<any>(chats);
    }
    catch(e){
        console.log(e);
        return AppResult.fail({code: 'CHAT_UNEXPECTED_ERROR'});
    }
  }
}
