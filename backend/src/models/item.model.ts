import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./user.model";

export interface IItem extends Document {
  name: string;
  description: string;
  quantity: number;
  price: number;
  createdBy: IUser["_id"];
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

export default mongoose.model<IItem>("Item", ItemSchema);
