import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AppResult, AppError } from '@suryac72/api-core-services';
import { Model } from 'mongoose';
import { Chat } from '../models/chat.schema';
import { User } from '../models/user.schema';
import { Message } from '../models/message.schema';
import { MESSAGE_BAD_REQUEST_ERRORS } from '../constants/message.constants';
import { MessageMapper } from '../mapper/message.mapper';
import { FetchMessageDTO } from '../dtos/message.dto';

@Injectable()
export class MessageRepository {
  constructor(
    @InjectModel('Chat') private chatModel: Model<Chat>,
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Message') private messageModel: Model<Message>,
    private readonly logger: Logger,
    private readonly messageMapper: MessageMapper,
  ) {}

  async getUserById(userId: string): Promise<User | null> {
    return this.userModel.findOne({ userId }).exec();
  }

  /**
   * Get all messages
   * @param chat
   * @param request
   * @returns
   */
  async fetchMessage(
    message: any,
  ): Promise<AppResult<any> | AppResult<AppError>> {
    try {
      const messages = await this.messageModel
        .find({
          chat: message.chatId.value,
        })
        .populate('sender', 'email userId')
        .populate('chat');
      const mappedResult = this.messageMapper.toFetchMessageDTO(messages);
      return AppResult.ok(mappedResult);
    } catch (error) {
      this.logger.error('Error from catch: fetchMessage', error);
      return AppResult.fail({
        code: MESSAGE_BAD_REQUEST_ERRORS.MESSAGE_UNEXPECTED_ERROR,
      });
    }
  }

  /**
   * Create new message
   * @param message
   * @param request
   * @returns
   */
  async sendMessage(
    message: any,
  ): Promise<AppResult<FetchMessageDTO> | AppResult<AppError>> {
    try {
      const user = await this.getUserById(message.userId.value);
      const messageBody = {
        sender: user._id,
        content: message.messageBody.value,
        chat: message.chatId.value,
      };
      let resultantMessage: any = await this.messageModel.create(messageBody);
      resultantMessage = await this.messageModel
        .findById(resultantMessage._id)
        .populate('chat')
        .populate('sender', 'email userId')
        .exec();

      resultantMessage = await this.userModel.populate(resultantMessage, {
        path: 'chat.users',
        select: 'email userId',
      });

      await this.chatModel.findByIdAndUpdate(message.chatId.value, {
        latestMessage: resultantMessage,
      });
      const mappedResult = this.messageMapper.toMessageDTO(resultantMessage);
      return AppResult.ok(mappedResult);
    } catch (error) {
      this.logger.error('Error from catch: sendMessage', error);
      return AppResult.fail({
        code: MESSAGE_BAD_REQUEST_ERRORS.MESSAGE_UNEXPECTED_ERROR,
      });
    }
  }
}
