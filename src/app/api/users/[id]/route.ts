import { NextResponse } from "next/server";
import { updateUser } from "@/actions/User";

import User, { User as UserType } from "@/model/User";
import { auth } from "@/auth";
import { sanitizeUser } from "@/lib/userUtils";
import { dbConnect } from "@/lib/mongo";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        await dbConnect();

        const { id } = await params;
        const session = await auth();
        const viewerId = session?.user?._id;

        // Fetch the full document including password to evaluate its existence
        let user = await User.findById(id).lean<UserType | null | undefined>();
        user = sanitizeUser(user, viewerId);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> },
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
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    try {
        await dbConnect();

        const session = await auth();

        if (!session?.user?._id || session.user._id !== id) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return new NextResponse(
                JSON.stringify({ error: "Error deleting user account." }),
                { status: 404 },
            );
        }

        return new NextResponse(
            JSON.stringify({
                message: "User profile successfully deleted.",
                deletedUser,
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            },
        );
    } catch (e: unknown) {
        if (e instanceof Error) {
            return new Response(JSON.stringify({ error: e.message }), {
                status: 500,
            });
        } else {
            return new Response(
                JSON.stringify({
                    error: "An unexpected error occurred while deleting your account.",
                }),
                { status: 500 },
            );
        }
    }
}
