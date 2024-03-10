import { Injectable, Logger } from '@nestjs/common';
import {
  ApiResponse,
  AppError,
  AppResult,
  DomainService,
  UseCase,
} from '@suryac72/api-core-services';
import { Request, Response } from 'express';
import { ChatDTO, FindOneChatDTO } from '@app/feature-chat/dtos/chat.dto';
import { chats } from '@app/feature-chat/data/data';
import { ChatParams } from './find-one-chat.dto';
import { ChatRepository } from '@app/feature-chat/repo/chat.repository';
import { FIND_ONE_CHAT } from '@app/feature-chat/domain/chat.domain';
import { CHAT_BAD_REQUEST_ERRORS } from '@app/feature-chat/constants/chat.constants';

type RequestBody = {
  params: ChatParams;
  request: Request;
  response: Response;
};

type ResponseBody =
  | AppResult<AppError>
  | AppResult<ApiResponse<FindOneChatDTO, unknown>>;

@Injectable()
export class FindOneChatUseCase implements UseCase<RequestBody, ResponseBody> {
  constructor(
    private chatRepository: ChatRepository,
    private readonly domainService: DomainService,
    private readonly loggerService: Logger,
  ) {}

  async execute(requestObj: RequestBody): Promise<ResponseBody> {
    try {
      const { params, request } = requestObj;
      const fetchChatDomain = await this.domainService.validateAndCreateDomain(
        FIND_ONE_CHAT,
        params,
      );
      if (AppResult.isInvalid(fetchChatDomain)) {
        return fetchChatDomain;
      }
      const chat = await this.chatRepository.fetchChat(
        fetchChatDomain.getValue(),
        request,
      );
      if (AppResult.isInvalid(chat)) {
        this.loggerService.error('Error from repository:fetchChat');
        return chat;
      }
      return AppResult.ok<ApiResponse<FindOneChatDTO, unknown>>({
        data: chat.getValue(),
      });
    } catch (e) {
      this.loggerService.error('Error from catch:FindOneChatUseCase', e);
      return AppResult.fail({
        code: CHAT_BAD_REQUEST_ERRORS.CHAT_UNEXPECTED_ERROR,
      });
    }
  }
}
