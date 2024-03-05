import { Injectable } from '@nestjs/common';
import { AppError, AppResult, COOKIE_NAME } from '@suryac72/api-core-services';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from '../models/chat.schema';
import { User } from '../models/user.schema';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../services/user.service';
import { User as UserDTO } from '../dtos/chat.dto';
@Injectable()
export class ChatRepository {
  constructor(
    @InjectModel('Chat') private chatModel: Model<Chat>,
    @InjectModel('User') private userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
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
  ): Promise<AppResult<any> | AppResult<AppError>> {
    try {
      const cookie = request?.headers?.cookie;
      const userDetails = await this.jwtService.decode(
        cookie.substring(COOKIE_NAME.length + 1).split(';')[0],
      );

      if (!userDetails) {
        AppResult.fail({ code: 'USER_SESSION_NOT_FOUND' });
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

        return AppResult.ok<any>(fullChat);
      }
    } catch (error) {
      console.error(error);
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

  /**
   * Method to create group chat
   * @param chat
   * @param request
   * @returns
   */
  async createGroupChat(
    chat: any,
    request: Request,
  ): Promise<AppResult<any> | AppResult<AppError>> {
    try {
      const cookie = request?.headers?.cookie;
      const userFromSession = await this.jwtService.decode(
        cookie.substring(COOKIE_NAME.length + 1).split(';')[0],
      );
      if (!userFromSession) {
        AppResult.fail({ code: 'USER_SESSION_NOT_FOUND' });
      }
      const users = chat.users.map((user) => {
        const obj: UserDTO = {
          userId: user.userId.value,
          email: user.email.value,
        };
        return obj;
      });
      let userDetails = JSON.parse(users);
      userDetails.push({
        userId: userFromSession.userId,
        email: userFromSession.email,
      });

      const usersCollection = await this.userService.getUsersByUserIds(
        userDetails.map((user) => user.userId),
      );
      const isGroupChat = await this.chatModel.findOne({
        isGroupChat: true,
        users: { $contains: usersCollection },
      });

      if (isGroupChat) {
        return AppResult.fail({ code: 'GROUP_CHAT_ALREADY_EXISTS' });
      }
      const groupChat = await this.chatModel.create({
        chatName: chat.chatName.value,
        users: usersCollection,
        isGroupChat: true,
        groupAdmin: usersCollection.find(
          (user) => user.userId === userFromSession.userId,
        ),
      });

      const fullChat = await this.chatModel
        .findOne({ _id: groupChat._id })
        .populate('users')
        .populate('groupAdmin');
      return AppResult.ok(fullChat);
    } catch (error) {
      console.error(error);
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
  ): Promise<AppResult<any> | AppResult<AppError>> {
    try {
      const cookie = request?.headers?.cookie;
      const userFromSession = await this.jwtService.decode(
        cookie.substring(COOKIE_NAME.length + 1).split(';')[0],
      );
      if (!userFromSession) {
        AppResult.fail({ code: 'USER_SESSION_NOT_FOUND' });
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
        return AppResult.fail({ code: 'CHAT_NOT_FOUND' });
      } else {
        return AppResult.ok(updatedChat);
      }
    } catch (error) {
      console.error(error);
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
  ): Promise<AppResult<any> | AppResult<AppError>> {
    try {
      const cookie = request?.headers?.cookie;
      const userFromSession = await this.jwtService.decode(
        cookie.substring(COOKIE_NAME.length + 1).split(';')[0],
      );
      if (!userFromSession) {
        AppResult.fail({ code: 'USER_SESSION_NOT_FOUND' });
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
        return AppResult.fail({ code: 'CHAT_NOT_FOUND' });
      } else {
        return AppResult.ok(removeUserFromGroupChat);
      }
    } catch (error) {
      console.error(error);
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
  ): Promise<AppResult<any> | AppResult<AppError>> {
    try {
      const cookie = request?.headers?.cookie;
      const userFromSession = await this.jwtService.decode(
        cookie.substring(COOKIE_NAME.length + 1).split(';')[0],
      );
      if (!userFromSession) {
        AppResult.fail({ code: 'USER_SESSION_NOT_FOUND' });
      }
      const foundUser = await this.userService.getUserByUserId(
        chat.userId.value,
      );
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

      if (!addUserFromGroupChat) {
        return AppResult.fail({ code: 'CHAT_NOT_FOUND' });
      } else {
        return AppResult.ok(addUserFromGroupChat);
      }
    } catch (error) {
      console.error(error);
      return AppResult.fail({ code: 'Failed to save chat' });
    }
  }
}
