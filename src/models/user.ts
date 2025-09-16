import mongoose, { Document, Schema } from "mongoose";

interface IUser extends Document {
  firstName : string;
  lastName : string;
  email: string;
  password: string;
  phone : string;
  role: "superadmin" | "admin" | "employer" | "user";
  resetToken?: string;
  resetTokenExpiry?: Date;
}

const UserSchema = new Schema<IUser>({
  firstName : { type : String , required: true },
  lastName : { type : String , required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role : {
    type : String,
    enum : ["superadmin", "admin", "employee", "user"],
    default : "user",
  },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
});

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
export { IUser, UserSchema };
