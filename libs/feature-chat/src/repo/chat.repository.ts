import { Injectable } from '@nestjs/common';
import { AppError, AppResult, COOKIE_NAME } from '@suryac72/api-core-services';
import { ChatRequestDTO } from '../use-cases/save-chat/save-chat.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from '../models/chat.schema';
import { User } from '../models/user.schema';
import { Request, response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../services/user.service';

@Injectable()
export class ChatRepository {
  constructor(
    @InjectModel('Chat') private chatModel: Model<Chat>,
    @InjectModel('User') private userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async saveChat(
    chat: any,
    request: Request,
  ): Promise<AppResult<any> | AppResult<AppError>> {
    try {
      const cookie = request?.headers?.cookie;
      const userDetails = await this.jwtService.decode(
        cookie.substring(COOKIE_NAME.length + 1).split(';')[0],
      );

      // Extract user IDs from the payload and decoded token
      const userIds = [chat.userId.value, userDetails.userId];
      // Find users in the database by their IDs
      const users = await this.userService.getUsersByUserIds(userIds);
      // Check if chat exists between these users
      let existingChat: any = await this.chatModel
        .find({
          isGroupChat: false,
          $and: [
            { users: { $elemMatch: { $eq: users[0]?._id } } },
            { users: { $elemMatch: { $eq: users[1]?._id } } },
          ], // Check if all user IDs are present in the chat's user array
        })
        .populate('users')
        .populate('latestMessage');

      existingChat = await this.userModel.populate(existingChat, {
        path: 'latestMessage.sender',
        select: 'userId email',
      });

      if (existingChat.length) {
        return AppResult.ok<any>(existingChat);
      } else {
        // Create new chat
        const newChat = new this.chatModel({
          id: chat.userId.value,
          chatName: chat.chatName.value,
          isGroupChat: chat.isGroupChat.value,
          users: [users[0]?._id, users[1]?._id], // Map user objects to user IDs
        });

        // Save the new chat
        const createdChat = await newChat.save();

        // Populate the created chat with user data
        const fullChat = await this.chatModel
          .findById(createdChat._id)
          .populate('users');

        return AppResult.ok<any>(fullChat);
      }
    } catch (error) {
      console.error(error);
      return AppResult.fail({ code: 'Failed to save chat' });
    }
  }

  async fetchChat(
    chat: any,
    request: Request,
  ): Promise<AppResult<any> | AppResult<AppError>> {
    try {
      const userIds = [chat.userId.value];
      // Find users in the database by their IDs
      const users = await this.userService.getUsersByUserIds(userIds);
      console.log(users);
      const chats = await this.chatModel
        .find({ users: { $elemMatch: { $eq: users[0]._id } } })
        .populate('users')
        .populate('groupAdmin')
        .populate('latestMessage')
        .sort({ updatedAt: -1 })
        .then(async (results: any) => {
          results = await this.userModel.populate(results, {
            path: 'latestMessage.sender',
            select: 'userId email',
          });
          return results;
        });
        return AppResult.ok(chats);
    } catch (error) {
      console.error(error);
      return AppResult.fail({ code: 'Failed to save chat' });
    }
  }
}
