import mongoose, { Schema, Document, PaginateModel } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface ICustomer extends Document {
  name: string;
  email: string;
  address: string;
  phone: string;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { timestamps: true }
);

CustomerSchema.plugin(mongoosePaginate);

export default mongoose.model<ICustomer>(
  "Customer",
  CustomerSchema
) as PaginateModel<ICustomer>;