import { NextRequest } from "next/server";


//API interface wrapping the User.ts file in the actions folder, for if we need to call any of those functions from the frontend
import { createUser, getUserByEmail, updateUser } from "@/actions/User";    


export async function GET(request: NextRequest) {
    const email = request.nextUrl.searchParams.get("email");
    if (!email) {
        return new Response(JSON.stringify({ error: "Email query parameter is required." }), { status: 400 });
    }
    const user = await getUserByEmail(email);
    if (!user) {
        return new Response(JSON.stringify({ error: "User not found." }), { status: 404 });
    }
    return new Response(JSON.stringify(user), { status: 200 });
}


export async function PUT(request: NextRequest) {
    const body = await request.json();
    const email = body.email;
    let userData:any = {};
    if(body.username) userData.username = body.username;
    if(body.password) userData.password = body.password;

    if (email) {
        updateUser(email, userData, true).then((result) => {
            if (result.error) {
                return new Response(JSON.stringify({ error: result.error }), { status: 400 });
            }   
        
        }).catch((error) => {
            return new Response(JSON.stringify({ error: "Internal server error." }), { status: 500 });
        });
    }
    else if( body.id) {
        updateUser(body.id, userData, false).then((result) => {
            if (result.error) {
                return new Response(JSON.stringify({ error: result.error }), { status: 400 });
            }   
    }).catch((error) => {
        return new Response(JSON.stringify({ error: "Internal server error." }), { status: 500 });
    });
    }
    else {
        return new Response(JSON.stringify({ error: "Email or ID is required to update user." }), { status: 400 });
    }
    

}
export async function POST(request: NextRequest) {
    const body = await request.json();
    if (!body.email || !body.name || !body.password) {
        return new Response(JSON.stringify({ error: "Email, name, and password are required." }), { status: 400 });
    }
    try {
        await createUser({
            email: body.email,
            name: body.name,
            password: body.password
        });
        return new Response(JSON.stringify({ success: "User created successfully." }), { status: 201 });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });     
    }
            
    }
