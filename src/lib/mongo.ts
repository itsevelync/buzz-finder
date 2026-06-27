import mongoose from "mongoose";
import "@/model/User";
import "@/model/Item";
import "@/model/LostItemPost";
import "@/model/ItemNote";
import "@/model/Message";
import "@/model/Notification";
import "@/model/ItemMatch";

export async function dbConnect() {
    try {
        const conn = await mongoose.connect(String(process.env.MONGODB_URI));
        return conn;
    } catch (e: unknown) {
        console.error(e);
        if (e instanceof Error) {
            throw new Error("Error: ", e);
        } else {
            throw new Error(
                "An unexpected error occurred connecting to MongoDB.",
            );
        }
    }
}
