import mongoose, { Schema, Document, PaginateModel } from "mongoose";
import { IItem } from "./item.model";
import { ICustomer } from "./customer.model";
import mongoosePaginate from "mongoose-paginate-v2";

export interface ISale extends Document {
  itemId: IItem["_id"];
  customerId?: ICustomer["_id"];
  quantity: number;
  date: Date;
  paymentType: "customer" | "cash" | "credit" | "debit";
}

const SaleSchema = new Schema<ISale>(
  {
    itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    quantity: { type: Number, required: true, min: 1 },
    date: { type: Date, required: true, default: Date.now },
    paymentType: {
      type: String,
      enum: ["customer", "cash", "credit", "debit"],
      required: true,
    },
  },
  { timestamps: true }
);

SaleSchema.plugin(mongoosePaginate);

export default mongoose.model<ISale>(
  "Sale",
  SaleSchema
) as PaginateModel<ISale>;
