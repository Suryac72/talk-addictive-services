import { Injectable } from '@nestjs/common';
import { ApiResponse, AppError, AppResult, DomainService, UseCase } from '@suryac72/api-core-services';
import { Request,Response } from 'express';
import { ChatDTO } from '@app/feature-chat/dtos/chat.dto';
import { chats } from '@app/feature-chat/data/data';
import { ChatParams } from './find-one-chat.dto';
import { ChatRepository } from '@app/feature-chat/repo/chat.repository';
import { FIND_ONE_CHAT } from '@app/feature-chat/domain/chat.domain';


type RequestBody = {
  params: ChatParams,
  request: Request,
  response: Response
};

type ResponseBody =
  | AppResult<AppError>
  |AppResult<ApiResponse<ChatDTO, unknown>>

@Injectable()
export class FindOneChatUseCase implements UseCase<RequestBody, ResponseBody> {
  constructor(
    private chatRepository: ChatRepository,
    private readonly domainService: DomainService,
  ) {}

  async execute(requestObj: RequestBody): Promise<ResponseBody> {
    try {

      const {params,request} = requestObj;
      const fetchChatDomain = await this.domainService.validateAndCreateDomain(FIND_ONE_CHAT,params);
      if(AppResult.isInvalid(fetchChatDomain)){
        return fetchChatDomain;
      }
      const chat = await this.chatRepository.fetchChat(fetchChatDomain.getValue(),request);
      return AppResult.ok<any>(chat);
    }
    catch(e){
        console.log(e);
        return AppResult.fail({code: 'CHAT_UNEXPECTED_ERROR'});
    }
  }
}
