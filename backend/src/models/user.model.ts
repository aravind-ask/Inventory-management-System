import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  name: string;
  password: string;
  role: "admin" | "staff";
  refreshToken?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "staff"], default: "staff" },
    refreshToken: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
