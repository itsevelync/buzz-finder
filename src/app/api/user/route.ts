import { NextResponse } from "next/server";
import { signupUser } from "@/actions/User";

export async function POST(req: Request) {
  const formData = await req.formData();
  const result = await signupUser(formData);

  if (result.error) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result, { status: 201 });
}