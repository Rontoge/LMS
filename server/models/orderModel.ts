import mongoose, { Schema,Model, Document } from "mongoose";



export interface IOrder extends Document {
    userId: string;
    courseId: string;
    payment_Info: object;
}

const orderSchema = new Schema<IOrder>({
    courseId: {
        type: String,
        required: true,
    },
    userId:{
        type: String,
        required: true,
    }, 
    payment_Info:{
        type: Object,
        // required: true,
    }
},{timestamps: true});