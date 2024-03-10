import { Injectable, Logger } from '@nestjs/common';
import {
  ApiResponse,
  AppError,
  AppResult,
  DomainService,
  UseCase,
} from '@suryac72/api-core-services';
import { Request, Response } from 'express';
import { GroupChatRequestBody } from './create-group-chat.dto';
import { ChatRepository } from '@app/feature-chat/repo/chat.repository';
import { CHAT_BAD_REQUEST_ERRORS } from '@app/feature-chat/constants/chat.constants';
import { CREATE_GROUP_CHAT } from '@app/feature-chat/domain/chat.domain';
import { FindOneChatDTO } from '@app/feature-chat/dtos/chat.dto';

type RequestBody = {
  body: GroupChatRequestBody;
  request: Request;
  response: Response;
};

type ResponseBody =
  | AppResult<AppError>
  | AppResult<ApiResponse<FindOneChatDTO, unknown>>;

@Injectable()
export class CreateGroupChatUseCase
  implements UseCase<RequestBody, ResponseBody>
{
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
        CREATE_GROUP_CHAT,
        body,
      );
      if (AppResult.isInvalid(chatDomain)) {
        return chatDomain;
      }
      const saveChats = await this.chatRepository.createGroupChat(
        chatDomain.getValue(),
        request,
      );
      if (AppResult.isInvalid(saveChats)) {
        this.logger.error('Error from repository:createGroupChat');
        return saveChats;
      }
      return AppResult.ok<ApiResponse<FindOneChatDTO, unknown>>({
        data: saveChats.getValue(),
      });
    } catch (e) {
      this.logger.error('Error from catch CreateGroupChatUseCase:');
      return AppResult.fail({
        code: CHAT_BAD_REQUEST_ERRORS.CHAT_UNEXPECTED_ERROR,
      });
    }
  }
}
