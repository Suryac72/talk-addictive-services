import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '../dtos/chat.dto';
import mongoose from 'mongoose';
import { Chat } from './chat.schema';

@Schema({ timestamps: true})
export class Message extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  sender:User;
  @Prop({ trim:true})
  content: String;
  @Prop({ type: mongoose.Schema.Types.ObjectId,ref:'Chat' })
  chat : Chat;
}

export const MessageSchema = SchemaFactory.createForClass(Message);