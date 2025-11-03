import { NextResponse } from "next/server";
import { updateUser } from "@/actions/User";
import User from "@/model/User";
import mongoose from "mongoose";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGODB_URI as string);
        }
        params = await params;
        const user = await User.findById(params.id).select("-password");

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    const body = await req.json();
    const result = await updateUser(params.id, body);

    if (result.error) {
        return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
}