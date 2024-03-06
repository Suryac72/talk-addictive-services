import { Injectable } from '@nestjs/common';
import {
  ApiResponse,
  AppError,
  AppResult,
  DomainService,
  UseCase,
} from '@suryac72/api-core-services';
import { Request, Response } from 'express';
import { MessageParamsDTO } from './find-all-message.dto';
import { MessageRepository } from '@app/feature-chat/repo/message.repository';
import { FIND_ALL_MESSAGE } from '@app/feature-chat/domain/message.domain';
import { MESSAGE_BAD_REQUEST_ERRORS } from '@app/feature-chat/constants/message.constants';
import { FetchMessageDTO } from '@app/feature-chat/dtos/message.dto';

type RequestBody = {
  params: MessageParamsDTO;
  request: Request;
  response: Response;
};

type ResponseBody = AppResult<AppError> | AppResult<ApiResponse<FetchMessageDTO[], unknown>>;

@Injectable()
export class FindAllMessageUseCase implements UseCase<RequestBody, ResponseBody> {
  constructor(
    private messageRepository: MessageRepository,
    private readonly domainService: DomainService,
  ) {}

  async execute(requestObj: RequestBody): Promise<ResponseBody> {
    try {
      const { params } = requestObj;
      const fetchMessageDomain = this.domainService.validateAndCreateDomain(
        FIND_ALL_MESSAGE,
        params,
      );
      if (AppResult.isInvalid(fetchMessageDomain)) {
        return fetchMessageDomain;
      }
      const messages = await this.messageRepository.fetchMessage(
        fetchMessageDomain.getValue(),
      );
      if(AppResult.isInvalid(messages)){
        return messages;
      }
      return AppResult.ok<ApiResponse<FetchMessageDTO[], unknown>>({data: messages.getValue()});
    } catch (e) {
      console.log(e);
      return AppResult.fail({ code: MESSAGE_BAD_REQUEST_ERRORS.MESSAGE_UNEXPECTED_ERROR });
    }
  }
}
