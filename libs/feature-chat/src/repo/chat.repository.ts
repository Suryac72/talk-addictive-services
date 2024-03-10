import { Injectable, Logger } from '@nestjs/common';
import {
  AppError,
  AppResult,
  COOKIE_NAME,
  USER_BAD_REQUEST_ERRORS,
} from '@suryac72/api-core-services';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from '../models/chat.schema';
import { User } from '../models/user.schema';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../services/user.service';
import {
  AddToGroupDTO,
  FindOneChatDTO,
  User as UserDTO,
} from '../dtos/chat.dto';
import { ChatMapper } from '../mapper/chat.mapper';
import { CHAT_BAD_REQUEST_ERRORS } from '../constants/chat.constants';
import { ChatRequestDTO } from '../use-cases/save-chat/save-chat.dto';
@Injectable()
export class ChatRepository {
  constructor(
    @InjectModel('Chat') private chatModel: Model<Chat>,
    @InjectModel('User') private userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly chatMapper: ChatMapper,
    private readonly logger: Logger,
  ) {}

  /**
   * Method to create one to one chat
   * @param chat
   * @param request
   * @returns
   */
  async saveChat(
    chat: any,
    request: Request,
  ): Promise<AppResult<FindOneChatDTO[]> | AppResult<AppError>> {
    try {
      const cookie = request?.headers?.cookie;
      const userDetails = await this.jwtService.decode(
        cookie.substring(COOKIE_NAME.length + 1).split(';')[0],
      );

      if (!userDetails) {
        AppResult.fail({ code: USER_BAD_REQUEST_ERRORS.USER_NOT_FOUND });
      }

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

        const mappedResponse = this.chatMapper.toFetchChatDTO(fullChat);
        return AppResult.ok<FindOneChatDTO[]>(mappedResponse);
      }
    } catch (error) {
      this.logger.error('Error from catch: saveChat', error);
      return AppResult.fail({ code: 'Failed to save chat' });
    }
  }

  /**
   * Method to fetch one to one chat
   * @param chat
   * @param request
   * @returns
   */
  async fetchChat(
    chat: any,
    request: Request,
  ): Promise<AppResult<any> | AppResult<AppError>> {
    try {
      const userIds = [chat.userId.value];
      // Find users in the database by their IDs
      const users = await this.userService.getUsersByUserIds(userIds);
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
      const mappedResult = this.chatMapper.toFetchChatDTO(chats);
      return AppResult.ok(mappedResult);
    } catch (error) {
      this.logger.error('Error from catch: fetchChat', error);
      return AppResult.fail({ code: 'Failed to save chat' });
    }
  }

  /**
   * Method to create group chat
   * @param chat
   * @param request
   * @returns
   */
  async createGroupChat(
    chat: any,
    request: Request,
  ): Promise<AppResult<FindOneChatDTO> | AppResult<AppError>> {
    try {
      const cookie = request?.headers?.cookie;
      const userFromSession = await this.jwtService.decode(
        cookie.substring(COOKIE_NAME.length + 1).split(';')[0],
      );
      if (!userFromSession) {
        return AppResult.fail({ code: USER_BAD_REQUEST_ERRORS.USER_NOT_FOUND });
      }

      const users = chat.users.value.map((user) => {
        const obj: UserDTO = {
          userId: user.userId.value,
          email: user.email.value,
        };
        return obj;
      });

      users.push({
        userId: userFromSession.userId,
        email: userFromSession.email,
      });

      const usersCollection = await this.userService.getUsersByUserIds(
        users.map((user) => user.userId),
      );

      const isGroupChat = await this.chatModel.findOne({
        isGroupChat: true,
        users: { $all: usersCollection.map((user) => user._id) },
      });

      if (isGroupChat) {
        return AppResult.fail({
          code: CHAT_BAD_REQUEST_ERRORS.GROUP_CHAT_ALREADY_EXISTS,
        });
      }

      const groupChat = await this.chatModel.create({
        chatName: chat.chatName.value,
        users: usersCollection.map((user) => user._id),
        isGroupChat: true,
        groupAdmin: usersCollection.find(
          (user) => user.userId === userFromSession.userId,
        ),
      });

      const fullChat = await this.chatModel
        .findOne({ _id: groupChat._id })
        .populate('users')
        .populate('groupAdmin');

      const mappedResponse = this.chatMapper.toGroupChatDTO(fullChat);
      return AppResult.ok(mappedResponse);
    } catch (error) {
      console.log(error);
      this.logger.error('Error from catch: createGroupChat', error);
      return AppResult.fail({ code: 'Failed to save chat' });
    }
  }

  /**
   * Method to rename group
   * @param chat
   * @param request
   * @returns
   */
  async renameGroup(
    chat: any,
    request: Request,
  ): Promise<AppResult<AddToGroupDTO> | AppResult<AppError>> {
    try {
      const cookie = request?.headers?.cookie;
      const userFromSession = await this.jwtService.decode(
        cookie.substring(COOKIE_NAME.length + 1).split(';')[0],
      );
      if (!userFromSession) {
        AppResult.fail({ code: USER_BAD_REQUEST_ERRORS.USER_NOT_FOUND });
      }
      const updatedChat = await this.chatModel
        .findByIdAndUpdate(
          chat.chatId.value,
          {
            chatName: chat.chatName.value,
          },
          {
            new: true,
          },
        )
        .populate('users')
        .populate('groupAdmin');

      if (!updatedChat) {
        return AppResult.fail({ code: CHAT_BAD_REQUEST_ERRORS.CHAT_NOT_FOUND });
      } else {
        const mappedResponse = this.chatMapper.toAddGroupChatDto(updatedChat);
        return AppResult.ok(mappedResponse);
      }
    } catch (error) {
      this.logger.error('Error from catch: renameGroup', error);
      return AppResult.fail({ code: 'Failed to save chat' });
    }
  }

  /**
   * Method to remove user from the group
   * @param chat
   * @param request
   * @returns
   */
  async removeFromGroupChat(
    chat: any,
    request: Request,
  ): Promise<AppResult<AddToGroupDTO> | AppResult<AppError>> {
    try {
      const cookie = request?.headers?.cookie;
      const userFromSession = await this.jwtService.decode(
        cookie.substring(COOKIE_NAME.length + 1).split(';')[0],
      );
      if (!userFromSession) {
        AppResult.fail({ code: USER_BAD_REQUEST_ERRORS.USER_NOT_FOUND });
      }
      const foundUser = await this.userService.getUserByUserId(
        chat.userId.value,
      );
      const removeUserFromGroupChat = await this.chatModel
        .findByIdAndUpdate(
          chat.chatId.value,
          {
            $pull: { users: foundUser._id },
          },
          {
            new: true,
          },
        )
        .populate('users')
        .populate('groupAdmin');

      if (!removeUserFromGroupChat) {
        return AppResult.fail({ code: CHAT_BAD_REQUEST_ERRORS.CHAT_NOT_FOUND });
      } else {
        const mappedResponse = this.chatMapper.toAddGroupChatDto(
          removeUserFromGroupChat,
        );
        return AppResult.ok(mappedResponse);
      }
    } catch (error) {
      this.logger.error('Error from catch: removeFromGroupChat', error);
      return AppResult.fail({ code: 'Failed to save chat' });
    }
  }

  /**
   * Add user to Group Chat
   * @param chat
   * @param request
   * @returns
   */
  async addUserToGroupChat(
    chat: any,
    request: Request,
  ): Promise<AppResult<AddToGroupDTO> | AppResult<AppError>> {
    try {
      const cookie = request?.headers?.cookie;
      const userFromSession = await this.jwtService.decode(
        cookie.substring(COOKIE_NAME.length + 1).split(';')[0],
      );
      if (!userFromSession) {
        return AppResult.fail({ code: USER_BAD_REQUEST_ERRORS.USER_NOT_FOUND });
      }
      const foundUser = await this.userService.getUserByUserId(
        chat.userId.value,
      );

      const groupChat = await this.chatModel.findById(chat.chatId.value);

      if (!groupChat) {
        return AppResult.fail({ code: CHAT_BAD_REQUEST_ERRORS.CHAT_NOT_FOUND });
      }

      // Check if the user is already part of the group
      if (groupChat.users.includes(foundUser._id)) {
        return AppResult.fail({
          code: CHAT_BAD_REQUEST_ERRORS.USER_ALREADY_IN_GROUP,
        });
      }

      const addUserFromGroupChat = await this.chatModel
        .findByIdAndUpdate(
          chat.chatId.value,
          {
            $push: { users: foundUser._id },
          },
          {
            new: true,
          },
        )
        .populate('users')
        .populate('groupAdmin');
      const mappedResponse =
        this.chatMapper.toAddGroupChatDto(addUserFromGroupChat);
      return AppResult.ok(mappedResponse);
    } catch (error) {
      this.logger.error('Error from catch: addToGroupChat', error);
      return AppResult.fail({ code: 'Failed to save chat' });
    }
  }
}
