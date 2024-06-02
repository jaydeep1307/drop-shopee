import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { UserRoles } from "src/common/enums";

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({
    type: String,
    enum: UserRoles,
    default: UserRoles.Customer,
  })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
