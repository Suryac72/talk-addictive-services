import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AppResult, AppError } from '@suryac72/api-core-services';
import { Model } from 'mongoose';
import { Chat } from '../models/chat.schema';
import { User } from '../models/user.schema';
import { Message } from '../models/message.schema';

@Injectable()
export class MessageRepository {
  constructor(
    @InjectModel('Chat') private chatModel: Model<Chat>,
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Message') private messageModel: Model<Message>,
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
      return AppResult.ok(messages);
    } catch (error) {
      console.error(error);
      return AppResult.fail({ code: 'MESSAGE_UNEXPECTED_ERROR' });
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
  ): Promise<AppResult<any> | AppResult<AppError>> {
    try {
      const user = await this.getUserById(message.userId.value);
      console.log(user);
      const messageBody = {
        sender: user._id,
        content: message.messageBody.value,
        chat: message.chatId.value,
      };
      let resultantMessage: any = await this.messageModel.create(messageBody);
      resultantMessage = await this.messageModel
        .findById(resultantMessage._id)
        .populate('sender', 'email userId')
        .populate('chat')
        .exec();

      resultantMessage = await this.userModel.populate(resultantMessage, {
        path: 'chat.users',
        select: 'email userId',
      });

      await this.chatModel.findByIdAndUpdate(message.chatId.value, {
        latestMessage: resultantMessage,
      });
      return AppResult.ok(resultantMessage);
    } catch (error) {
      console.error(error);
      return AppResult.fail({ code: 'MESSAGE_UNEXPECTED_ERROR' });
    }
  }
}
