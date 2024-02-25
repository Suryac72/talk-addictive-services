import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '../dtos/chat.dto';
import mongoose from 'mongoose';
import { Message } from './message.schema';

@Schema({ timestamps: true})
export class Chat extends Document {
  @Prop({ trim: true })
  chatName: string;
  @Prop({ default: false })
  isGroupChat: Boolean;
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  users: User[];
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Message' })
  latestMessage : Message;
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  groupAdmin : User;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);