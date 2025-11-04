import mongoose from "mongoose";

export async function dbConnect() {
    try {
        const conn = await mongoose.connect(String(process.env.MONGODB_URI));
        return conn;
    } catch (e: unknown) {
        if (e instanceof Error) {
            throw new Error("Error: ", e);
        } else {
            throw new Error("An unexpected error occurred connecting to MongoDB.");
        }
    }
}