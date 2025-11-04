'use server'

import User from "@/model/User";
import { dbConnect } from "@/lib/mongo";
import { Types } from "mongoose";
import { signIn, signOut } from "@/auth";
import bcrypt from "bcryptjs";
import { ObjectId } from 'mongodb';

interface NewUser {
    name: string;
    email: string;
    username: string;
    password?: string;
}

interface UserData {
    _id: ObjectId;
    name: string;
    password?: string;
    email: string;
    username?: string;
    phoneNum?: string;
    description?: string;
}

interface UserUpdateData {
    name?: string;
    password?: string;
    email?: string;
    username?: string;
    phoneNum?: string;
    description?: string;
}

interface UserDeleteData {
    confirmation?: string;
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
export async function getUserByEmail(email: string): Promise<UserData> {
    try {
        await dbConnect();
        const user = await User.findOne({ email });
        return user;
    } catch (e: any) {
        throw new Error("Error finding user by email:", e);
    }
}

// Finds a user by their username.
export async function getUserByUsername(username: string): Promise<UserData> {
    try {
        await dbConnect();
        const user = await User.findOne({ username });
        return user;
    } catch (e: any) {
        throw new Error("Error finding user by username:", e);
    }
}

export async function updateUser(userId: string, userData: UserUpdateData): Promise<{ success?: string; error?: string }> {
    // Check if the userId is a valid ObjectId before updating
    if (!Types.ObjectId.isValid(userId)) {
        return { error: "Invalid user ID." };
    }

    try {
        await dbConnect();

        // Hash password
        const dataToUpdate = { ...userData };
        if (dataToUpdate.password) {
            dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(userId, dataToUpdate, {
            new: true,
            runValidators: true,
        });

        if (!updatedUser) {
            return { error: "User not found." };
        }

        return { success: "User updated successfully." };
    } catch (e: any) {
        return { error: "Unable to update user, please try again." };
    }
}

export async function deleteUser(userId: string, userData: UserDeleteData): Promise<{ success?: string; error?: string }> {
    // Check if the userId is a valid ObjectId before updating
    if (!Types.ObjectId.isValid(userId)) {
        return { error: "Invalid user ID." };
    }

    try {
        await dbConnect();

        if (userData.confirmation !== "Confirm Deletion") {
            return { error: "Confirmation text does not match." };
        }

        const userToDelete = await User.findById(userId);

        if (!userToDelete) {
            return { error: "User not found." };
        }
        
        doLogout();
        const deletedUser = await User.findByIdAndDelete(userId);


        return { success: "User deleted successfully." };
    } catch (e: any) {
        return { error: "Unable to delete user, please try again." };
    }
}

export async function updateUserFromEmail(email: string, userData: UserUpdateData): Promise<{ success?: string; error?: string }> {
    const user = await getUserByEmail(email);
    return await updateUser(user._id.toString(), userData)
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

    const username = await generateUsername(email);

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await createUser({ name, username, email, password: hashedPassword });
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: 'Failed to create account. Please try again in a few moments.' };
    }
}

export async function generateUsername(email: string) {
    // Auto-generate username from email
    let username = email.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '');

    // Ensure username is unique, append a number if needed
    const baseUsername = username;
    let counter = 1;
    while (await getUserByUsername(username)) {
        username = `${baseUsername}${counter}`;
        counter++;
    }

    return username;
}
