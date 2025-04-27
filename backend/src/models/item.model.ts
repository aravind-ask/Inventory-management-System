import mongoose, { Schema, Document, Types, PaginateModel } from "mongoose";
import { IUser } from "./user.model";
import mongoosePaginate from "mongoose-paginate-v2";

export interface IItem extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  quantity: number;
  price: number;
  createdBy: IUser["_id"];
  createdAt?: Date;
  updatedAt?: Date;
}

const ItemSchema = new Schema<IItem>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

ItemSchema.plugin(mongoosePaginate);

export default mongoose.model<IItem>(
  "Item",
  ItemSchema
) as PaginateModel<IItem>;
