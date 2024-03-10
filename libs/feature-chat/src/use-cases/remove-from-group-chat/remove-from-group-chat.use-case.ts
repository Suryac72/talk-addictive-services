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
import { CHAT_BAD_REQUEST_ERRORS } from '@app/feature-chat/constants/chat.constants';
import { ADD_TO_GROUP } from '@app/feature-chat/domain/chat.domain';
import { GroupChatRequestBodyDTO } from '../add-to-group-chat/add-to-group-chat.dto';
import { AddToGroupDTO } from '@app/feature-chat/dtos/chat.dto';

type RequestBody = {
  body: GroupChatRequestBodyDTO;
  request: Request;
  response: Response;
};

type ResponseBody = AppResult<AppError> | AppResult<ApiResponse<AddToGroupDTO, unknown>>;

@Injectable()
export class RemoveUserFromGroupUseCase implements UseCase<RequestBody, ResponseBody> {
  constructor(
    private chatRepository: ChatRepository,
    private readonly domainService: DomainService,
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
        ADD_TO_GROUP,
        body,
      );
      if (AppResult.isInvalid(chatDomain)) {
        return chatDomain;
      }
      const saveChats = await this.chatRepository.removeFromGroupChat(
        chatDomain.getValue(),
        request,
      );
      if (AppResult.isInvalid(saveChats)) {
        return saveChats;
      }
      return AppResult.ok<ApiResponse<AddToGroupDTO, unknown>>({data: saveChats.getValue()});
    } catch (e) {
      console.log(e);
      return AppResult.fail({ code: 'CHAT_UNEXPECTED_ERROR' });
    }
  }
}
