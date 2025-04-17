import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  address: string;
  mobile: string;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    mobile: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICustomer>("Customer", CustomerSchema);
