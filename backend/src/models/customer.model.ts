import mongoose, { Schema, Document, PaginateModel, Types } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface ICustomer extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  address: string;
  phone: string;
  createdAt?: Date;
  updatedAt?: Date;
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
