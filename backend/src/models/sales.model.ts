import mongoose, { Schema, Document } from "mongoose";
import { IItem } from "./item.model";
import { ICustomer } from "./customer.model";

export interface ISale extends Document {
  itemId: IItem["_id"];
  customerId?: ICustomer["_id"];
  quantity: number;
  date: Date;
  paymentType: "customer" | "cash";
}

const SaleSchema = new Schema<ISale>(
  {
    itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    quantity: { type: Number, required: true, min: 1 },
    date: { type: Date, required: true, default: Date.now },
    paymentType: { type: String, enum: ["customer", "cash"], required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISale>("Sale", SaleSchema);
