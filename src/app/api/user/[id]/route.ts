import { NextResponse } from "next/server";
import { deleteUser, updateUser } from "@/actions/User";

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

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const body = await req.json();
    const result = await deleteUser(params.id, body);

    if (result.error) {
        return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
}
