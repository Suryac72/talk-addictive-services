import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageRepository } from '../repo/message.repository';
import { Logger } from '@nestjs/common';

@WebSocketGateway()
export class ChatGateway {
constructor(private readonly messageRepository: MessageRepository,private readonly logger:Logger) {}
  @WebSocketServer() server: Server;

  @SubscribeMessage('setup')
  async handleSetup(client: Socket, userData: any) {
    const user = await this.messageRepository.getUserById(userData.userId);
    if (user) {
      client.join(user.userId);
      client.emit('connected');
    }
  }


  @SubscribeMessage('join chat')
  handleJoinChat(client: Socket, room: string) {
    client.join(room);
    this.logger.log(`User Joined Room: ${room}`);
  }

  @SubscribeMessage('typing')
  handleTyping(client: Socket, room: string) {
    client.in(room).emit('typing');
  }

  @SubscribeMessage('stop typing')
  handleStopTyping(client: Socket, room: string) {
    client.in(room).emit('stop typing');
  }

  @SubscribeMessage('new message')
  handleNewMessage(client: Socket, newMessageRecieved: any) {
    const chat = newMessageRecieved.chat;

    if (!chat.users) return this.logger.log('chat.users not defined');

    chat.users.forEach((user: any) => {
      if (user._id === newMessageRecieved.sender._id) return;
      client.in(user._id).emit('message received', newMessageRecieved);
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log('Client disconnected');
  }
}
