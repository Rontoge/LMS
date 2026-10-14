import mongoose, { Schema,Model, Document } from "mongoose";

export interface IOrder extends Document {
    title: string;
    message: string;
    status: string;
    userId: string;
}

const  notificationSchema = new Schema<IOrder>({
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: "unread"
    }
},{timestamps: true});

const NotificationModel: Model<IOrder> = mongoose.model<IOrder>("Notification", notificationSchema);
export default NotificationModel;