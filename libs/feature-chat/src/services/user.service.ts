import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from '../models/user.schema'; // Assuming this is the correct path to your User model
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
  ) {}

  async getUserByUserId(userId: string): Promise<User | null> {
    return this.userModel.findOne({ userId }).exec();
  }

  async getUsersByUserIds(userIds: string[]): Promise<User[]> {
    return this.userModel.find({ userId: { $in: userIds } }).exec();
  }
}
