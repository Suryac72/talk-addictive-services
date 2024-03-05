import { Injectable } from '@nestjs/common';
import {
  ApiResponse,
  AppError,
  AppResult,
  DomainService,
  UseCase,
} from '@suryac72/api-core-services';
import { Request, Response } from 'express';
import { ChatRepository } from '@app/feature-chat/repo/chat.repository';
import { ChatMapper } from '@app/feature-chat/mapper/chat.mapper';
import { CHAT_BAD_REQUEST_ERRORS } from '@app/feature-chat/constants/chat.constants';
import { RenameGroupRequestDTO } from './rename-group-chat.dto';
import { RENAME_GROUP } from '@app/feature-chat/domain/chat.domain';

type RequestBody = {
  body: RenameGroupRequestDTO;
  request: Request;
  response: Response;
};

type ResponseBody = AppResult<AppError> | AppResult<ApiResponse<any, unknown>>;

@Injectable()
export class RenameGroupChatUseCase implements UseCase<RequestBody, any> {
  constructor(
    private chatRepository: ChatRepository,
    private readonly domainService: DomainService,
    private readonly chatMapper: ChatMapper,
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
        RENAME_GROUP,
        body,
      );
      if (AppResult.isInvalid(chatDomain)) {
        return chatDomain;
      }
      const saveChats = await this.chatRepository.renameGroup(
        chatDomain.getValue(),
        request,
      );
      if (AppResult.isInvalid(saveChats)) {
        return saveChats;
      }
      return AppResult.ok<any>(saveChats);
    } catch (e) {
      console.log(e);
      return AppResult.fail({ code: 'CHAT_UNEXPECTED_ERROR' });
    }
  }
}
