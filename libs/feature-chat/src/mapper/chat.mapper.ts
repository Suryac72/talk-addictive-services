import { Injectable } from '@nestjs/common';
import { AddToGroupDTO, FindOneChatDTO } from '../dtos/chat.dto';

@Injectable()
export class ChatMapper {
  toFetchChatDTO(chats: any): FindOneChatDTO[] {
    const dto: FindOneChatDTO[] = [];
    chats.map((chat) => {
      const chatObj: FindOneChatDTO = {
        chatId: chat._id,
        isGroupChat: chat.isGroupChat,
        users: chat.users.map((user) => {
          const userObj = 
            {
              userId: user.userId,
              email: user.email,
            }
            return userObj;
        }),
        chatName: chat.chatName,
      };
      if(chat.groupAdmin) {
        chatObj.groupAdmin = {
            userId: chat.groupAdmin.userId,
            email: chat.groupAdmin.email,
        }
      }
      dto.push(chatObj);
    });

    return dto;
  }

  toAddGroupChatDto(chat: any) : AddToGroupDTO {
    const dto :AddToGroupDTO = {
       chatId: chat._id,
       userId: chat.users.map(user => {
        const userIdObj  = {
          userId: user.userId
        }
        return userIdObj;
       }),
       status: true
    }
    return dto;
  }

  toGroupChatDTO(chat: any) : FindOneChatDTO {
    const chatObj: FindOneChatDTO = {
      chatId: chat._id,
      isGroupChat: chat.isGroupChat,
      users: chat.users.map((user) => {
        const userObj = 
          {
            userId: user.userId,
            email: user.email,
          }
          return userObj;
      }),
      chatName: chat.chatName,
    };
    if(chat.groupAdmin) {
      chatObj.groupAdmin = {
          userId: chat.groupAdmin.userId,
          email: chat.groupAdmin.email,
      }
    }
    return chatObj;
  }
  
}
