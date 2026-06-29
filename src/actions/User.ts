"use server";

import User, { User as UserType } from "@/model/User";
import { dbConnect } from "@/lib/mongo";
import { Types } from "mongoose";
import { signIn, signOut } from "@/auth";
import bcrypt from "bcryptjs";
import { CredentialsSignin } from "next-auth";
import { MongoServerError } from "mongodb";
import { auth } from "@/auth";
import { compareResetCode } from "@/actions/ResetCode";
import { sanitizeUser } from "@/lib/userUtils";

interface NewUser {
    name: string;
    email: string;
    username?: string;
    password?: string;
}

export interface UserUpdateData {
    name?: string;
    password?: string;
    email?: string;
    username?: string;
    phoneNum?: string;
    description?: string;
    image?: string;
    instagram?: string;
    discord?: string;
    linkedIn?: string;
    hideEmail?: boolean;
    resetCode?: string;
}

export async function createUser(user: NewUser) {
    try {
        await dbConnect();
        const createdUser = await User.create(user);

        return createdUser;
    } catch (e: unknown) {
        if (e instanceof Error) {
            throw new Error(`Error creating user: ${e.message}`);
        }
        throw new Error("Unexpected error creating user.");
    }
}

// Finds a user by their email address.
export async function getUserByEmail(email: string) {
    try {
        await dbConnect();
        const user = await User.findOne({ email });
        return user;
    } catch (e: unknown) {
        if (e instanceof Error) {
            throw new Error("Error finding user by email:", e);
        }
        throw new Error("Unexpected error creating finding user by email.");
    }
}

// Finds a user by their username.
export async function getUserByUsername(username: string, viewerId?: string) {
    await dbConnect();

    let userDoc = await User.findOne({ username })
        .select("-password")
        .lean<UserType | null | undefined>();

    userDoc = sanitizeUser(userDoc, viewerId);

    if (!userDoc) return null;

    return {
        ...userDoc,
        _id: userDoc._id.toString(),
    };
}

export async function updateUser(
    userId: string,
    userData: UserUpdateData & { currentPassword?: string; resetCode?: string },
) {
    if (!Types.ObjectId.isValid(userId)) {
        return { error: "Invalid user ID." };
    }

    try {
        await dbConnect();

        const user = await User.findById(userId);
        if (!user) {
            return { error: "User not found." };
        }

        const session = await auth();
        const sessionUserId = session?.user?._id;

        const { currentPassword, resetCode, ...updateFields } = userData;
        const dataToUpdate = { ...updateFields };

        // Condition 1: User is updating their own profile via an active session
        const isAuthenticatedOwner = sessionUserId && sessionUserId === userId;

        // Condition 2: User is unauthenticated but passed a valid reset code
        let isResetCodeValid = false;
        if (!isAuthenticatedOwner && resetCode) {
            // Check if the provided code matches the one stored in the DB for this user's email
            const verificationResult = await compareResetCode(
                user.email,
                resetCode,
            );
            if (verificationResult.success) {
                isResetCodeValid = true;
            }
        }

        // If they fail both checks, deny the request
        if (!isAuthenticatedOwner && !isResetCodeValid) {
            return {
                error: "Unauthorized. You must be logged in or provide a valid verification code.",
            };
        }

        if (dataToUpdate.password) {
            // Check if the user already has a password set in the database
            const hasExistingPassword = !!user.password;

            // Only enforce checking the old password if they are logged in normally AND they actually have a password to check
            if (isAuthenticatedOwner && hasExistingPassword) {
                if (!currentPassword) {
                    return { error: "Current password is required to change your password." };
                }

                const isMatch = await bcrypt.compare(
                    currentPassword,
                    user.password,
                );

                if (!isMatch) {
                    return { error: "Current password is incorrect." };
                }
            }

            // Hash and save the new password
            dataToUpdate.password = await bcrypt.hash(
                dataToUpdate.password,
                10,
            );
        }

        const updatedUser = await User.findByIdAndUpdate(userId, dataToUpdate, {
            new: true,
            runValidators: true,
        });

        if (!updatedUser) {
            return { error: "User not found." };
        }

        // If a reset code was successfully used, delete it so it can't be reused immediately
        if (isResetCodeValid) {
            const ResetCodeModel = (await import("@/model/ResetCode")).default;
            await ResetCodeModel.deleteMany({ userId: user._id });
        }

        return { success: "User updated successfully." };
    } catch (err: unknown) {
        const mongoErr = err as MongoServerError;

        if (
            mongoErr.codeName === "DuplicateKey" &&
            mongoErr.keyPattern.username === 1
        ) {
            return { error: "This username is already taken." };
        }
        return { error: "Unable to update user, please try again." };
    }
}

export async function updateUserFromEmail(
    email: string,
    userData: UserUpdateData,
) {
    const user = await getUserByEmail(email);
    return await updateUser(user._id.toString(), userData);
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
    } catch (err: unknown) {
        if (err instanceof CredentialsSignin) {
            return {
                error: err.code,
            };
        } else if (err instanceof Error) {
            return {
                error: "An error occurred while logging in: " + err.message,
            };
        } else {
            return {
                error: "An unexpected error occurred while trying to log in. Please try again later.",
            };
        }
    }
}

export async function signupUser(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
        return { error: "All fields are required." };
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
        return { error: "Email already in use." };
    }

    const username = await generateUsername(email);

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await createUser({ name, username, email, password: hashedPassword });
        return { success: true };
    } catch (error) {
        console.error(error);
        return {
            error: "Failed to create account. Please try again in a few moments.",
        };
    }
}

export async function generateUsername(email: string) {
    // Auto-generate username from email
    let username = email.split("@")[0].replace(/[^a-zA-Z0-9._-]/g, "");

    // Ensure username is unique, append a number if needed
    const baseUsername = username;
    let counter = 1;
    while (await getUserByUsername(username)) {
        username = `${baseUsername}${counter}`;
        counter++;
    }

    return username;
}
