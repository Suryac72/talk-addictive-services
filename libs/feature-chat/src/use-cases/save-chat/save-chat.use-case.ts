import { Injectable, Logger } from '@nestjs/common';
import {
  ApiResponse,
  AppError,
  AppResult,
  DomainService,
  UseCase,
} from '@suryac72/api-core-services';
import { Request, Response } from 'express';
import { ChatRequestDTO } from './save-chat.dto';
import { ChatRepository } from '@app/feature-chat/repo/chat.repository';
import { SAVE_CHAT_DOMAIN } from '@app/feature-chat/domain/chat.domain';
import { CHAT_BAD_REQUEST_ERRORS } from '@app/feature-chat/constants/chat.constants';
import { FindOneChatDTO } from '@app/feature-chat/dtos/chat.dto';

type RequestBody = {
  body: ChatRequestDTO;
  request: Request;
  response: Response;
};

type ResponseBody =
  | AppResult<AppError>
  | AppResult<ApiResponse<FindOneChatDTO[], unknown>>;

@Injectable()
export class SaveChatUseCase implements UseCase<RequestBody, ResponseBody> {
  constructor(
    private chatRepository: ChatRepository,
    private readonly domainService: DomainService,
    private readonly logger: Logger,
  ) {}

  async execute(requestObj: RequestBody): Promise<ResponseBody> {
    try {
      const { body, request } = requestObj;
      if (Object.values(body).length <= 0) {
        return AppResult.fail({
          code: CHAT_BAD_REQUEST_ERRORS.INVALID_CHAT_REQUEST_BODY,
        });
      }
      const chatDomain = this.domainService.validateAndCreateDomain(
        SAVE_CHAT_DOMAIN,
        body,
      );
      if (AppResult.isInvalid(chatDomain)) {
        return chatDomain;
      }
      const saveChats = await this.chatRepository.saveChat(
        chatDomain.getValue(),
        request,
      );
      if (AppResult.isInvalid(saveChats)) {
        this.logger.error('Error from catch: repository:saveChat');
        return saveChats;
      }
      return AppResult.ok<ApiResponse<FindOneChatDTO[], unknown>>({
        data: saveChats.getValue(),
      });
    } catch (e) {
      this.logger.error('Error from catch: SaveChatUseCase');
      return AppResult.fail({
        code: CHAT_BAD_REQUEST_ERRORS.CHAT_UNEXPECTED_ERROR,
      });
    }
  }
}
