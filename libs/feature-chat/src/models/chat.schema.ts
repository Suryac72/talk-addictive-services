import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Message } from './message.schema';
import { Document } from 'mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true})
export class Chat extends Document {
  @Prop({ trim: true })
  chatName: string;
  @Prop({ default: false })
  isGroupChat: Boolean;
  @Prop({ type: [{ type: String, ref: 'User' }] }) 
  users: string[];
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Message' })
  latestMessage: Message;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  groupAdmin: User;
}



export const ChatSchema = SchemaFactory.createForClass(Chat);