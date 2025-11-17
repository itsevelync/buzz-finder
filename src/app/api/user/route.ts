import { NextResponse } from "next/server";
import { signupUser } from "@/actions/User";
import { NextRequest } from "next/server";
import UserSchema from "@/model/User";
import {dbConnect} from "@/lib/mongo";
import mongoose from "mongoose";

export async function POST(req: Request) {
  const formData = await req.formData();
  const result = await signupUser(formData);

  if (result.error) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result, { status: 201 });
}

export async function PATCH(req:NextRequest) {
    const body = await req.json();
    const { id, ...updateData } = body;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return new Response(JSON.stringify({ error: "Invalid or missing ID." }), { status: 400 });
    }
    try {
        await dbConnect();
        const updatedItem = await UserSchema.findByIdAndUpdate(
            id, 
            { $set: updateData },
            { new: true, runValidators: true }
        );
        if (!updatedItem) {
            return new Response(JSON.stringify({ error: "Item not found." }), { status: 404 });
        }
        return new Response(JSON.stringify(updatedItem), { status: 200 });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}

export async function DELETE(req:NextRequest) {
    const id = req.nextUrl.searchParams.get("id");
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return new Response(JSON.stringify({ error: "Invalid or missing ID." }), { status: 400 });
    }
    try {
        await dbConnect();
        const deletedItem = await UserSchema.findByIdAndDelete(id); 
        if (!deletedItem) {
            return new Response(JSON.stringify({ error: "User not found." }), { status: 404 });
        }  
        return new Response(JSON.stringify(deletedItem), { status: 200 });
    }
    catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}