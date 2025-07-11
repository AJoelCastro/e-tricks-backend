import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/User";

const UserSchema = new Schema<IUser>({

})
export const UserModel =  mongoose.model<IUser>('User', UserSchema);