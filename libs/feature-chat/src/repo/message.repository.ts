import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { AppResult, AppError } from '@suryac72/api-core-services';
import { Model } from 'mongoose';
import { Chat } from '../models/chat.schema';
import { User } from '../models/user.schema';
import { UserService } from '../services/user.service';
import { Message } from '../models/message.schema';

@Injectable()
export class MessageRepository {
  constructor(
    @InjectModel('Chat') private chatModel: Model<Chat>,
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Message') private messageModel: Model<Message>,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async getUserById(userId: string): Promise<User | null> {
    return this.userModel.findOne({ userId }).exec();
  }
}
