import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true})
export class User extends Document {
  @Prop({ trim: true })
  userId: string;
  @Prop({  trim: true  })
  email: string;
}

export const UserSchema = SchemaFactory.createForClass(User);