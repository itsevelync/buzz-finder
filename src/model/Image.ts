import mongoose, { Schema } from "mongoose";

const ImageSchema = new Schema(
    {
        name: {
            type: String,
            required: false,
        },
        filepath: {
            type: String,
            required: true,
        }
    }
);



export default mongoose.models?.ImageSchema ??
  mongoose.model("Image", ImageSchema);