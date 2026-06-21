import { NextResponse } from "next/server";
import { deleteUser, updateUser } from "@/actions/User";

import User, { User as UserType } from "@/model/User";
import mongoose from "mongoose";
import { auth } from "@/auth";
import { sanitizeUser } from "@/lib/userUtils";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGODB_URI as string);
        }

        const { id } = await params;
        const session = await auth();
        const viewerId = session?.user?._id;

        // Fetch the full document including password to evaluate its existence
        const rawUser = await User.findById(id).lean<UserType>();

        if (!rawUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Determine if they have a password before stripping it out
        const hasPassword = !!rawUser.password;

        // Construct the client-safe object without exposing the hash
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = rawUser;
        let user: UserType | undefined | null = {
            ...userWithoutPassword,
            hasPassword,
        };

        user = sanitizeUser(user, viewerId);

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const body = await req.json();
    const { id } = await params;
    const result = await updateUser(id.toString(), body);

    if (result.error) {
        return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const body = await req.json();
    const { id } = await params;
    const result = await deleteUser(id, body);

    if (result.error) {
        return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
}
