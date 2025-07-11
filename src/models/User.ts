import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/User";

const UserSchema = new Schema<IUser>({
    
})
export default mongoose.model<IUser>('User', UserSchema);