import { Injectable } from '@nestjs/common';
import { ApiResponse, AppError, AppResult, DomainService, UseCase } from '@suryac72/api-core-services';
import { Request,Response } from 'express';
import { ChatDTO } from '@app/feature-chat/dtos/chat.dto';
import { chats } from '@app/feature-chat/data/data';
import { ChatParams } from './find-one-chat.dto';


type RequestBody = {
  params: ChatParams
};

type ResponseBody =
  | AppResult<AppError>
  |AppResult<ApiResponse<ChatDTO, unknown>>

@Injectable()
export class FindOneChatUseCase implements UseCase<RequestBody, ResponseBody> {
  constructor(
    // private chatRepository: ChatRepository,
    private readonly domainService: DomainService,
  ) {}

  async execute(requestObj: RequestBody): Promise<ResponseBody> {
    try {
      const { params } = requestObj;
      return AppResult.ok<any>(chats.find(chat=>chat._id === params.id));
    }
    catch(e){
        console.log(e);
        return AppResult.fail({code: 'CHAT_UNEXPECTED_ERROR'});
    }
  }
}
