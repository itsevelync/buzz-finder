'use server'

import User from "@/model/User";
import { dbConnect } from "@/lib/mongo";
import { Types } from "mongoose";
import { signIn, signOut } from "@/auth";
import bcrypt from "bcryptjs";

interface NewUser {
    name: string;
    email: string;
    password?: string;
}

interface UserUpdateData {
    password?: string;
    name?: string;
}

export async function createUser(user: NewUser) {
    try {
        await dbConnect();
        await User.create(user);
    } catch (e: any) {
        throw new Error(e);
    }
}

// Finds a user by their email address.
export async function getUserByEmail(email: string) {
    try {
        await dbConnect();
        const user = await User.findOne({ email });
        return user;
    } catch (e: any) {
        console.error("Error finding user by email:", e);
        return null;
    }
}

export async function updateUser(
    userId: string,
    userData: UserUpdateData,
    is_email: boolean = false
): Promise<{ success?: string; error?: string }> {
    try {
        await dbConnect();
        let userToUpdate = userId;

        if (is_email) {
            const user = await User.findOne({ email: userId });
            if (!user) {
                return { error: "User not found." };
            }
            userToUpdate = user._id.toString();
        }

        // Check if the userId is a valid ObjectId before updating
        if (!Types.ObjectId.isValid(userToUpdate)) {
            return { error: "Invalid user ID." };
        }

        // Hash password
        const dataToUpdate = { ...userData };
        if (dataToUpdate.password) {
            dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(userToUpdate, dataToUpdate, {
            new: true,
            runValidators: true,
        });

        if (!updatedUser) {
            return { error: "User not found or unable to update." };
        }

        return { success: "User updated successfully." };
    } catch (e: any) {
        if (e.name === 'ValidationError') {
            return { error: e.message };
        }
        return { error: "Unable to update user, please try again." };
    }
}

// USER AUTHENTICATION

export async function doSocialLogin(formData: FormData) {
    const action = formData.get("action");
    if (typeof action !== "string") {
        throw new Error("Invalid action");
    }
    await signIn(action, { redirectTo: "/dashboard" });
}

export async function doLogout() {
    await signOut({ redirectTo: "/" });
}

export async function doCredentialLogin(formData: FormData) {
    const email = formData.get("email");
    const password = formData.get("password");

    if (typeof email !== "string" || typeof password !== "string") {
        return { error: "Invalid login credentials." };
    }

    if (email === "" || password === "") {
        return { error: "Email and password are required." };
    }

    try {
        const response = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (!response || response.error) {
            return { error: "Login failed. Please try again." };
        }

        return response;
    } catch (err: any) {
        return {
            error:
                err?.code ||
                "An unexpected error occurred while trying to log in. Please try again later.",
        };
    }
}

export async function signupUser(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
        return { error: 'All fields are required.' };
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        return { error: 'Email already in use.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await createUser({ name, email, password: hashedPassword });
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: 'Failed to create account. Please try again in a few moments.' };
    }
}