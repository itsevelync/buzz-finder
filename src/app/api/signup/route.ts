import { NextResponse } from "next/server";
import { createUser } from "@/actions/User";

import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/mongo";

interface CreateUserRequestBody {
    name: string;
    email: string;
    password: string;
}

export const POST = async (request: Request) => {
    const { name, email, password }: CreateUserRequestBody = await request.json();

    await dbConnect();
    const hashedPassword = await bcrypt.hash(password, 5);
    const newUser = {
        name,
        password: hashedPassword,
        email
    }
    try {
        await createUser(newUser);
    } catch (e: unknown) {
        if (e instanceof Error) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500 });
        }
        return new Response(JSON.stringify({ error: "An unexpected error occurred at POST /api/signup." }), { status: 500 })
    }

    return new NextResponse("User has been created", {
        status: 201,
    });

}