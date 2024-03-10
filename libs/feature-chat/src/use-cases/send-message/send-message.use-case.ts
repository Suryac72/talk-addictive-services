import { Injectable, Logger } from '@nestjs/common';
import {
  ApiResponse,
  AppError,
  AppResult,
  DomainService,
  UseCase,
} from '@suryac72/api-core-services';
import { Request, Response } from 'express';
import { MessageRequestDTO } from './send-message.dto';
import { MessageRepository } from '@app/feature-chat/repo/message.repository';
import { MESSAGE_BAD_REQUEST_ERRORS } from '@app/feature-chat/constants/message.constants';
import { SEND_MESSAGE } from '@app/feature-chat/domain/message.domain';
import { FetchMessageDTO } from '@app/feature-chat/dtos/message.dto';

type RequestBody = {
  body: MessageRequestDTO;
  request: Request;
  response: Response;
};

type ResponseBody =
  | AppResult<AppError>
  | AppResult<ApiResponse<FetchMessageDTO, unknown>>;

@Injectable()
export class SendMessageUseCase implements UseCase<RequestBody, any> {
  constructor(
    private messageRepository: MessageRepository,
    private readonly domainService: DomainService,
    private readonly loggerService: Logger
    
  ) {}

  async execute(requestObj: RequestBody): Promise<ResponseBody> {
    try {
      const { body } = requestObj;
      if (Object.values(body).length <= 0) {
        return AppResult.fail({
          code: MESSAGE_BAD_REQUEST_ERRORS.INVALID_MESSAGE_REQUEST_BODY,
        });
      }
      const messageDomain = this.domainService.validateAndCreateDomain(
        SEND_MESSAGE,
        body,
      );
      if (AppResult.isInvalid(messageDomain)) {
        return messageDomain;
      }
      const sendMessage = await this.messageRepository.sendMessage(
        messageDomain.getValue(),
      );
      if (AppResult.isInvalid(sendMessage)) {
        this.loggerService.error('Error from repository:sendMessage');
        return sendMessage;
      }
      return AppResult.ok<ApiResponse<FetchMessageDTO, unknown>>({
        data: sendMessage.getValue(),
      });
    } catch (e) {
      this.loggerService.error('Error from catch:SendMessageUseCase', e);
      return AppResult.fail({
        code: MESSAGE_BAD_REQUEST_ERRORS.MESSAGE_UNEXPECTED_ERROR,
      });
    }
  }
}
