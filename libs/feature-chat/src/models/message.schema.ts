import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Chat } from './chat.schema';
import { Document } from 'mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true})
export class Message extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  sender: User;
  @Prop({ trim: true })
  content: string;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' })
  chat: Chat;
}

export const MessageSchema = SchemaFactory.createForClass(Message);