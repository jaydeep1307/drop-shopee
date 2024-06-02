import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { ProductStatus } from "src/common/enums";

export type ProductDocument = Product & Document;

@Schema({
  timestamps: true,
})
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  image: string;

  @Prop({
    type: String,
    enum: ProductStatus,
    default: ProductStatus.NotReadyToBid,
  })
  status: ProductStatus;

  @Prop({ required: false })
  bidWinner: string;

  @Prop({ default: 0 })
  bookedSlots: number;

  @Prop({ required: false })
  bidSlots: [{ slotPrice: number; slotUnits: number; remainingUnits: number }];

  @Prop({ required: false })
  bidUsers: [{ userId: string; investedAmount: number }];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
